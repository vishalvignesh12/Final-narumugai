import { isAuthenticated } from '@/lib/authentication';
import { connectDB } from '@/lib/databaseConnection';
import { catchError, response } from '@/lib/helperFunction';
import { addCartItemSchema, canFitCartQuantity, getAvailableVariantQuantity, removeCartItemSchema, updateCartItemSchema } from '@/lib/legacyCartContract';
import ProductVariantModel from '@/models/ProductVariant.model';
import UserModel from '@/models/User.model';

async function getUserAuth() {
  const auth = await isAuthenticated('user');
  return auth.isAuth ? auth : null;
}

async function findActiveVariant(variantId) {
  return ProductVariantModel.findOne({ _id: variantId, deletedAt: null })
    .populate({
      path: 'product',
      select: 'name sellingPrice mrp media isAvailable deletedAt',
      populate: { path: 'media', select: 'secure_url' },
    })
    .populate('media', 'secure_url')
    .lean();
}

export async function GET() {
  try {
    const auth = await getUserAuth();
    if (!auth) return response(false, 401, 'Unauthorized.');
    await connectDB();

    const user = await UserModel.findById(auth.userId).select('cart').lean();
    if (!user) return response(false, 404, 'User not found.');

    const products = [];
    for (const cartItem of user.cart || []) {
      const variant = await findActiveVariant(cartItem.variantId);
      if (!variant?.product || variant.product.deletedAt) continue;
      const price = variant.sellingPrice ?? variant.product.sellingPrice;
      const mrp = variant.mrp ?? variant.product.mrp;
      products.push({
        ...cartItem,
        product: variant.product,
        variantDetails: {
          size: variant.size,
          color: variant.color,
          stock: getAvailableVariantQuantity(variant),
          sellingPrice: price,
          mrp,
        },
        media: variant.media?.[0]?.secure_url || variant.product.media?.[0]?.secure_url,
      });
    }

    const count = products.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = products.reduce((sum, item) => sum + item.variantDetails.sellingPrice * item.qty, 0);
    const discount = products.reduce((sum, item) => sum + (item.variantDetails.mrp - item.variantDetails.sellingPrice) * item.qty, 0);
    return response(true, 200, 'Cart retrieved successfully.', { products, count, subtotal, discount });
  } catch (error) {
    return catchError(error);
  }
}

export async function POST(request) {
  try {
    const auth = await getUserAuth();
    if (!auth) return response(false, 401, 'Unauthorized.');
    const parsed = addCartItemSchema.safeParse(await request.json());
    if (!parsed.success) return response(false, 400, 'Invalid cart item.', parsed.error.flatten());
    await connectDB();

    const { productId, variantId, qty } = parsed.data;
    const variant = await findActiveVariant(variantId);
    if (!variant?.product || variant.product.deletedAt || !variant.product.isAvailable || String(variant.product._id) !== productId) {
      return response(false, 404, 'Product option not found or unavailable.');
    }

    const user = await UserModel.findById(auth.userId).select('cart').lean();
    if (!user) return response(false, 404, 'User not found.');
    const current = user.cart?.find((item) => String(item.variantId) === variantId)?.qty || 0;
    const newQuantity = current + qty;
    if (!canFitCartQuantity(newQuantity, getAvailableVariantQuantity(variant))) return response(false, 409, 'Not enough stock available.');

    if (current) {
      await UserModel.updateOne(
        { _id: auth.userId, 'cart.variantId': variantId },
        { $set: { 'cart.$.qty': newQuantity } },
      );
    } else {
      await UserModel.updateOne(
        { _id: auth.userId },
        { $push: { cart: { productId: variant.product._id, variantId, qty } } },
      );
    }
    return response(true, 200, 'Product added to cart successfully.');
  } catch (error) {
    return catchError(error);
  }
}

export async function PUT(request) {
  try {
    const auth = await getUserAuth();
    if (!auth) return response(false, 401, 'Unauthorized.');
    const parsed = updateCartItemSchema.safeParse(await request.json());
    if (!parsed.success) return response(false, 400, 'Invalid cart update.', parsed.error.flatten());
    await connectDB();

    const { variantId, qty } = parsed.data;
    const variant = await findActiveVariant(variantId);
    if (!variant?.product || variant.product.deletedAt || !variant.product.isAvailable) {
      return response(false, 404, 'Product option not found or unavailable.');
    }
    if (!canFitCartQuantity(qty, getAvailableVariantQuantity(variant))) return response(false, 409, 'Not enough stock available.');

    const updated = await UserModel.findOneAndUpdate(
      { _id: auth.userId, 'cart.variantId': variantId },
      { $set: { 'cart.$.qty': qty } },
      { new: true, projection: { _id: 1 } },
    ).lean();
    if (!updated) return response(false, 404, 'Cart item not found.');
    return response(true, 200, 'Cart updated successfully.');
  } catch (error) {
    return catchError(error);
  }
}

export async function DELETE(request) {
  try {
    const auth = await getUserAuth();
    if (!auth) return response(false, 401, 'Unauthorized.');
    const parsed = removeCartItemSchema.safeParse(await request.json());
    if (!parsed.success) return response(false, 400, 'Invalid cart item.', parsed.error.flatten());
    await connectDB();

    const result = await UserModel.updateOne(
      { _id: auth.userId },
      { $pull: { cart: { variantId: parsed.data.variantId } } },
    );
    if (!result.modifiedCount) return response(false, 404, 'Cart item not found.');
    return response(true, 200, 'Product removed from cart successfully.');
  } catch (error) {
    return catchError(error);
  }
}
