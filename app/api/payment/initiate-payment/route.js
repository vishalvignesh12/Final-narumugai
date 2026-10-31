import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { zSchema } from "@/lib/zodSchema";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model"; // --- FIX: Import model
import ProductVariantModel from "@/models/ProductVariant.model"; // --- FIX: Import model
import CouponModel from "@/models/Coupon.model"; // --- FIX: Import model
import { z } from "zod";
import crypto from "crypto";
import { v4 as uuidv4 } from 'uuid';
import { isAuthenticated } from "@/lib/authentication";
import { checkoutProductSchema } from "@/lib/checkout-contract";

// --- FIX: Updated orderSchema ---
// REMOVED totals, as they are not trusted from the client.
// ADDED couponCode to be validated by the server.
const orderSchema = zSchema.pick({
    name: true, email: true, phone: true, country: true, state: true, city: true, pincode: true, landmark: true, ordernote: true
}).extend({
    userId: z.string().optional(),
    products: z.array(checkoutProductSchema),
    couponCode: z.string().optional() // Client sends the code, not the amount
});


// --- FIX: NEW HELPER FUNCTION TO CALCULATE TOTALS ON SERVER ---
async function calculateServerTotal(products, couponCode) {
    let subtotal = 0;
    let discount = 0;
    let couponDiscountAmount = 0;
    const pricedProducts = [];

    for (const item of products) {
        let price = 0;
        let mrp = 0;

        try {
             if (item.variantId && item.variantId !== 'null' && !item.variantId.includes('fallback-')) {
                // It's a real variant
                const variant = await ProductVariantModel.findById(item.variantId).select('sellingPrice mrp product size color').populate('product', 'name');
                if (!variant) throw new Error(`Variant ${item.name} not found.`);
                if (!variant.product || String(variant.product._id) !== String(item.productId)) throw new Error('Cart item does not match its selected variant.');
                price = variant.sellingPrice;
                mrp = variant.mrp;
                pricedProducts.push({ ...item, inventoryType: 'variant', name: variant.product.name, size: variant.size, color: variant.color, sellingPrice: price, mrp });
            } else {
                // It's a fallback product
                const productId = item.variantId?.startsWith('fallback-') 
                    ? item.variantId.replace('fallback-', '') 
                    : item.productId; // Use productId if variantId is null
                if (String(productId) !== String(item.productId)) {
                    throw new Error('Cart item does not match its selected product.');
                }
                const product = await ProductModel.findById(productId).select('name sellingPrice mrp');
                if (!product) throw new Error(`Product ${item.name} not found.`);
                const hasVariants = await ProductVariantModel.exists({ product: productId, deletedAt: null });
                if (hasVariants) throw new Error(`${product.name} requires a size or product option selection.`);
                price = product.sellingPrice;
                mrp = product.mrp;
                pricedProducts.push({ ...item, variantId: null, inventoryType: 'product', productId, name: product.name, sellingPrice: price, mrp });
            }

            subtotal += price * item.qty;
            discount += (mrp - price) * item.qty;

        } catch (error) {
            console.error(`Error fetching price for item ${item.name}: ${error.message}`);
            throw new Error(`One or more products in your cart are invalid. Please try again.`);
        }
    }

    // Securely validate coupon on the server
    if (couponCode) {
        const coupon = await CouponModel.findOne({ 
            code: couponCode, 
            deletedAt: null,
            expiryDate: { $gte: new Date() } 
        });

        if (!coupon) {
            throw new Error('The coupon code is invalid or has expired.');
        }
        if (subtotal < coupon.minShoppingAmount) {
            throw new Error(`Coupon requires a minimum purchase of ${coupon.minShoppingAmount}.`);
        }

        couponDiscountAmount = (subtotal * coupon.discountPercentage) / 100;
    }

    const totalAmount = subtotal - couponDiscountAmount;

    return { subtotal, discount, couponDiscountAmount, totalAmount, pricedProducts };
}


// --- (generateHash function remains the same) ---
const generateHash = (data, salt) => {
    let hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${salt}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
};

export async function POST(request) {
    let session;
    try {
        await connectDB();
        const payload = await request.json();

        // 1. Validate incoming data (schema no longer contains totals)
        const validate = orderSchema.safeParse(payload);
        if (!validate.success) {
            // Return the detailed Zod error
            return response(false, 400, 'Invalid or missing fields.', { error: validate.error.flatten() });
        }

        const validatedData = validate.data;
        const auth = await isAuthenticated('user');
        if (!process.env.PAYU_KEY || !process.env.PAYU_SALT || !process.env.PAYU_ENDPOINT || !process.env.NEXT_PUBLIC_BASE_URL) {
            throw new Error('Payment configuration is incomplete.');
        }

        // --- 2. (CRITICAL FIX) SERVER-SIDE PRICE VERIFICATION ---
        const { subtotal, discount, couponDiscountAmount, totalAmount, pricedProducts } =
            await calculateServerTotal(validatedData.products, validatedData.couponCode);

        // This is the amount we will charge, calculated securely
        const amount = totalAmount;

        // 3. Generate unique transaction ID (txnid)
        const txnid = uuidv4();
        
        // Reserve all requested stock and create its pending order atomically.
        session = await OrderModel.startSession();
        session.startTransaction();
        for (const item of validatedData.products) {
            const isRealVariant = item.variantId && item.variantId !== 'null' && !item.variantId.startsWith('fallback-');
            if (isRealVariant) {
                const variant = await ProductVariantModel.findOneAndUpdate(
                    { _id: item.variantId, deletedAt: null, quantity: { $gte: item.qty } },
                    { $inc: { quantity: -item.qty } },
                    { new: true, session }
                ).populate('product', 'name isAvailable deletedAt').lean();
                if (!variant?.product || !variant.product.isAvailable || variant.product.deletedAt) {
                    throw new Error(`${variant?.product?.name || item.name} is no longer available in the requested quantity.`);
                }
                if (variant.quantity === 0) {
                    await ProductVariantModel.updateOne({ _id: variant._id }, { $set: { soldAt: new Date() } }, { session });
                    const remaining = await ProductVariantModel.countDocuments({ product: variant.product._id, deletedAt: null, quantity: { $gt: 0 } }).session(session);
                    if (remaining === 0) await ProductModel.updateOne({ _id: variant.product._id }, { $set: { isAvailable: false, soldAt: new Date() } }, { session });
                }
            } else {
                const productId = item.variantId?.startsWith('fallback-') ? item.variantId.slice('fallback-'.length) : item.productId;
                const hasVariants = await ProductVariantModel.findOne({ product: productId, deletedAt: null }).session(session).select('_id').lean();
                if (hasVariants) throw new Error(`${item.name} requires a size or product option selection.`);
                const product = await ProductModel.findOneAndUpdate(
                    { _id: productId, deletedAt: null, isAvailable: true, quantity: { $gte: item.qty } },
                    { $inc: { quantity: -item.qty } },
                    { new: true, session }
                ).lean();
                if (!product) throw new Error(`${item.name} is no longer available in the requested quantity.`);
                if (product.quantity === 0) await ProductModel.updateOne({ _id: product._id }, { $set: { isAvailable: false, soldAt: new Date() } }, { session });
            }
        }

        // Create a "pending" order in the same transaction as the reservation.
        const newOrder = new OrderModel({
            user: auth.isAuth ? auth.userId : undefined,
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            country: validatedData.country,
            state: validatedData.state,
            city: validatedData.city,
            pincode: validatedData.pincode,
            landmark: validatedData.landmark,
            ordernote: validatedData.ordernote,
            products: pricedProducts,
            
            // --- FIX: Use SERVER-CALCULATED values ---
            discount: discount,
            couponDiscountAmount: couponDiscountAmount,
            totalAmount: amount,
            subtotal: subtotal,
            
            transaction_id: txnid, // Save our unique txnid
            order_id: txnid, // Use txnid as the order_id
            status: 'pending-payment' // New status
        });

        await newOrder.save({ session });
        await session.commitTransaction();

        // 5. Prepare PayU data
        const payuData = {
            key: process.env.PAYU_KEY,
            txnid: txnid,
            amount: amount.toString(), // --- FIX: Use server-calculated amount
            productinfo: "Narumugai Order",
            firstname: validatedData.name.split(' ')[0],
            email: validatedData.email,
            phone: validatedData.phone,
            surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/verify`,
            furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/verify`,
            endpoint: process.env.PAYU_ENDPOINT
        };

        // 6. Generate the hash and add it to the data
        const hash = generateHash(payuData, process.env.PAYU_SALT);
        payuData.hash = hash;

        // 7. Return all PayU data to the frontend
        return response(true, 200, 'Payment initiated.', payuData);

    } catch (error) {
        if (session?.inTransaction()) await session.abortTransaction();
        // This will catch errors from calculateServerTotal (e.g., bad coupon)
        return catchError(error);
    } finally {
        await session?.endSession();
    }
}
