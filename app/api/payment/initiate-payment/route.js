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

// --- (productSchema remains the same) ---
const productSchema = z.object({
    productId: z.string().length(24, 'Invalid product id format'),
    variantId: z.string(), // Allow fallback IDs
    name: z.string().min(1),
    qty: z.number().min(1),
    mrp: z.number().nonnegative(),
    sellingPrice: z.number().nonnegative()
});

// --- FIX: Updated orderSchema ---
// REMOVED totals, as they are not trusted from the client.
// ADDED couponCode to be validated by the server.
const orderSchema = zSchema.pick({
    name: true, email: true, phone: true, country: true, state: true, city: true, pincode: true, landmark: true, ordernote: true
}).extend({
    userId: z.string().optional(),
    products: z.array(productSchema),
    couponCode: z.string().optional() // Client sends the code, not the amount
});


// --- FIX: NEW HELPER FUNCTION TO CALCULATE TOTALS ON SERVER ---
async function calculateServerTotal(products, couponCode) {
    let subtotal = 0;
    let discount = 0;
    let couponDiscountAmount = 0;

    for (const item of products) {
        let price = 0;
        let mrp = 0;

        try {
             if (item.variantId && item.variantId !== 'null' && !item.variantId.includes('fallback-')) {
                // It's a real variant
                const variant = await ProductVariantModel.findById(item.variantId).select('sellingPrice mrp');
                if (!variant) throw new Error(`Variant ${item.name} not found.`);
                price = variant.sellingPrice;
                mrp = variant.mrp;
            } else {
                // It's a fallback product
                const productId = item.variantId?.startsWith('fallback-') 
                    ? item.variantId.replace('fallback-', '') 
                    : item.productId;
                const product = await ProductModel.findById(productId).select('sellingPrice mrp');
                if (!product) throw new Error(`Product ${item.name} not found.`);
                price = product.sellingPrice;
                mrp = product.mrp;
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

    return { subtotal, discount, couponDiscountAmount, totalAmount };
}


// --- (generateHash function remains the same) ---
const generateHash = (data, salt) => {
    let hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${salt}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
};

export async function POST(request) {
    try {
        await connectDB();
        const payload = await request.json();

        // 1. Validate incoming data (schema no longer contains totals)
        const validate = orderSchema.safeParse(payload);
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', { error: validate.error });
        }

        const validatedData = validate.data;

        // --- 2. (CRITICAL FIX) SERVER-SIDE PRICE VERIFICATION ---
        const { subtotal, discount, couponDiscountAmount, totalAmount } = 
            await calculateServerTotal(validatedData.products, validatedData.couponCode);

        // This is the amount we will charge, calculated securely
        const amount = totalAmount;

        // 3. Generate unique transaction ID (txnid)
        const txnid = uuidv4();
        
        // 4. Create a "pending" order in the database
        const newOrder = new OrderModel({
            user: validatedData.userId,
            name: validatedData.name,
            email: validatedData.email,
            phone: validatedData.phone,
            country: validatedData.country,
            state: validatedData.state,
            city: validatedData.city,
            pincode: validatedData.pincode,
            landmark: validatedData.landmark,
            ordernote: validatedData.ordernote,
            products: validatedData.products,
            
            // --- FIX: Use SERVER-CALCULATED values ---
            discount: discount,
            couponDiscountAmount: couponDiscountAmount,
            totalAmount: amount,
            subtotal: subtotal,
            
            transaction_id: txnid, // Save our unique txnid
            order_id: txnid, // Use txnid as the order_id
            status: 'pending-payment' // New status
        });

        await newOrder.save();

        // 5. Prepare PayU data
        const payuData = {
            key: process.env.PAYU_KEY,
            txnid: txnid,
            amount: amount.toString(), // --- FIX: Use server-calculated amount
            productinfo: "Narumugai Order",
            firstname: validatedData.name.split(' ')[0],
            email: validatedData.email,
            phone: validatedData.phone,
            surl: `${process.env.PAYU_PROTOCOL}://${request.headers.get('host')}/api/payment/verify`,
            furl: `${process.env.PAYU_PROTOCOL}://${request.headers.get('host')}/api/payment/verify`,
            endpoint: process.env.PAYU_ENDPOINT
        };

        // 6. Generate the hash and add it to the data
        const hash = generateHash(payuData, process.env.PAYU_SALT);
        payuData.hash = hash;

        // 7. Return all PayU data to the frontend
        return response(true, 200, 'Payment initiated.', payuData);

    } catch (error) {
        // This will catch errors from calculateServerTotal (e.g., bad coupon)
        return catchError(error);
    }
}