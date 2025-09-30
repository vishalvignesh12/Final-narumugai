// app/api/cart/route.js
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import UserModel from "@/models/User.model";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function GET(request) {
  try {
    await connectDB();

    // Extract token from cookies in the request
    const authHeader = request.headers.get('cookie');
    const match = authHeader?.match(/access_token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return response(false, 401, "Unauthorized");
    }

    // Verify token
    if (!process.env.SECRET_KEY) {
      console.error('SECRET_KEY is not defined in environment variables');
      return response(false, 500, "Server configuration error");
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.SECRET_KEY));
    const userId = payload._id;

    const user = await UserModel.findById(userId).select("cart").lean();
    if (!user) {
      return response(false, 404, "User not found");
    }

    // Populate the cart items with product and variant details
    if (user.cart && user.cart.length > 0) {
      const cartItems = [];
      for (const cartItem of user.cart) {
        const variant = await ProductVariantModel.findById(cartItem.variantId)
          .populate('product', 'name sellingPrice mrp media')
          .populate('media', 'secure_url')
          .lean();

        if (variant) {
          cartItems.push({
            ...cartItem,
            product: variant.product,
            variantDetails: {
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
              sellingPrice: variant.sellingPrice || variant.product?.sellingPrice,
              mrp: variant.mrp || variant.product?.mrp
            },
            media: variant.media?.secure_url || variant.product?.media?.[0]?.secure_url
          });
        }
      }
      
      // Calculate totals
      const count = cartItems.reduce((total, item) => total + (item.qty || 1), 0);
      const subtotal = cartItems.reduce((sum, item) => sum + ((item.variantDetails?.sellingPrice || 0) * (item.qty || 1)), 0);
      const discount = cartItems.reduce((sum, item) => {
        const sellingPrice = item.variantDetails?.sellingPrice || 0;
        const mrp = item.variantDetails?.mrp || 0;
        return sum + ((mrp - sellingPrice) * (item.qty || 1));
      }, 0);

      return response(true, 200, "Cart retrieved successfully.", {
        products: cartItems,
        count,
        subtotal,
        discount
      });
    } else {
      return response(true, 200, "Cart retrieved successfully.", {
        products: [],
        count: 0,
        subtotal: 0,
        discount: 0
      });
    }
  } catch (error) {
    return catchError(error);
  }
}

export async function POST(request) {
  try {
    await connectDB();

    // Extract token from cookies in the request
    const authHeader = request.headers.get('cookie');
    const match = authHeader?.match(/access_token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return response(false, 401, "Unauthorized");
    }

    // Verify token
    if (!process.env.SECRET_KEY) {
      console.error('SECRET_KEY is not defined in environment variables');
      return response(false, 500, "Server configuration error");
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.SECRET_KEY));
    const userId = payload._id;

    const { productId, variantId, qty = 1 } = await request.json();

    if (!productId || !variantId) {
      return response(false, 400, "Product ID and Variant ID are required");
    }

    // Verify product variant exists and has enough stock
    const variant = await ProductVariantModel.findById(variantId).lean();
    if (!variant) {
      return response(false, 404, "Product variant not found");
    }

    if (variant.stock < qty) {
      return response(false, 400, "Not enough stock available");
    }

    // Add item to user's cart or update quantity if it already exists
    const user = await UserModel.findOne({ _id: userId, "cart.variantId": variantId });
    
    if (user) {
      // If the item exists, update the quantity
      await UserModel.findOneAndUpdate(
        { _id: userId, "cart.variantId": variantId },
        { $inc: { "cart.$.qty": qty } },
        { new: true }
      );
    } else {
      // If the item doesn't exist, add it to the cart
      await UserModel.findByIdAndUpdate(
        userId,
        { $push: { cart: { productId, variantId, qty } } },
        { new: true }
      );
    }

    return response(true, 200, "Product added to cart successfully.");
  } catch (error) {
    return catchError(error);
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    // Extract token from cookies in the request
    const authHeader = request.headers.get('cookie');
    const match = authHeader?.match(/access_token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return response(false, 401, "Unauthorized");
    }

    // Verify token
    if (!process.env.SECRET_KEY) {
      console.error('SECRET_KEY is not defined in environment variables');
      return response(false, 500, "Server configuration error");
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.SECRET_KEY));
    const userId = payload._id;

    const { variantId, qty } = await request.json();

    if (!variantId || qty === undefined) {
      return response(false, 400, "Variant ID and quantity are required");
    }

    // Update the quantity of the specific cart item
    const updatedUser = await UserModel.findOneAndUpdate(
      { 
        _id: userId, 
        "cart.variantId": variantId 
      },
      { $set: { "cart.$.qty": qty } },
      { new: true }
    );

    if (!updatedUser) {
      return response(false, 404, "Cart item not found");
    }

    return response(true, 200, "Cart updated successfully.");
  } catch (error) {
    return catchError(error);
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    // Extract token from cookies in the request
    const authHeader = request.headers.get('cookie');
    const match = authHeader?.match(/access_token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return response(false, 401, "Unauthorized");
    }

    // Verify token
    if (!process.env.SECRET_KEY) {
      console.error('SECRET_KEY is not defined in environment variables');
      return response(false, 500, "Server configuration error");
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.SECRET_KEY));
    const userId = payload._id;

    const { variantId } = await request.json();

    if (!variantId) {
      return response(false, 400, "Variant ID is required");
    }

    // Remove the item from the user's cart
    await UserModel.findByIdAndUpdate(
      userId,
      { $pull: { cart: { variantId } } }
    );

    return response(true, 200, "Product removed from cart successfully.");
  } catch (error) {
    return catchError(error);
  }
}