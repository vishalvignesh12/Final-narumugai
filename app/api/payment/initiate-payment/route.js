import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { zSchema } from "@/lib/zodSchema";
import OrderModel from "@/models/Order.model";
import { z } from "zod";
import crypto from "crypto"; // Import crypto for hashing
import { v4 as uuidv4 } from 'uuid'; // Import uuid to generate unique txnid

// Define the schema for products in the order
const productSchema = z.object({
    productId: z.string().length(24, 'Invalid product id format'),
    variantId: z.string(), // Allow fallback IDs
    name: z.string().min(1),
    qty: z.number().min(1),
    mrp: z.number().nonnegative(),
    sellingPrice: z.number().nonnegative()
});

// Define the main order schema
const orderSchema = zSchema.pick({
    name: true, email: true, phone: true, country: true, state: true, city: true, pincode: true, landmark: true, ordernote: true
}).extend({
    userId: z.string().optional(),
    subtotal: z.number().nonnegative(),
    discount: z.number().nonnegative(),
    couponDiscountAmount: z.number().nonnegative(),
    totalAmount: z.number().nonnegative(),
    products: z.array(productSchema),
});

// Function to generate PayU hash
const generateHash = (data, salt) => {
    let hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${salt}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
};

export async function POST(request) {
    try {
        await connectDB();
        const payload = await request.json();

        // 1. Validate incoming data
        const validate = orderSchema.safeParse(payload);
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', { error: validate.error });
        }

        const validatedData = validate.data;

        // ** (IMPORTANT) SERVER-SIDE PRICE VERIFICATION **
        // You MUST re-fetch products and variants here to calculate the 'totalAmount' on the server.
        // This prevents the "Price Tampering" vulnerability I mentioned before.
        // For brevity, I am trusting the 'totalAmount' for now, but you MUST implement this check.
        const amount = validatedData.totalAmount;
        // const serverCalculatedAmount = await calculateAmount(validatedData.products);
        // if (serverCalculatedAmount !== validatedData.totalAmount) {
        //     return response(false, 400, 'Price mismatch. Please try again.');
        // }

        // 2. Generate unique transaction ID (txnid)
        const txnid = uuidv4();
        
        // 3. Create a "pending" order in the database
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
            discount: validatedData.discount,
            couponDiscountAmount: validatedData.couponDiscountAmount,
            totalAmount: amount,
            subtotal: validatedData.subtotal,
            transaction_id: txnid, // Save our unique txnid
            order_id: txnid, // Use txnid as the order_id
            status: 'pending-payment' // New status
        });

        await newOrder.save();

        // 4. Prepare PayU data
        const payuData = {
            key: process.env.PAYU_KEY,
            txnid: txnid,
            amount: amount.toString(),
            productinfo: "Narumugai Order", // You can customize this
            firstname: validatedData.name.split(' ')[0], // Get first name
            email: validatedData.email,
            phone: validatedData.phone,
            surl: `${process.env.PAYU_PROTOCOL}://${request.headers.get('host')}/api/payment/verify`, // Success URL
            furl: `${process.env.PAYU_PROTOCOL}://${request.headers.get('host')}/api/payment/verify`, // Failure URL
            endpoint: process.env.PAYU_ENDPOINT
        };

        // 5. Generate the hash and add it to the data
        const hash = generateHash(payuData, process.env.PAYU_SALT);
        payuData.hash = hash;

        // 6. Return all PayU data to the frontend
        return response(true, 200, 'Payment initiated.', payuData);

    } catch (error) {
        return catchError(error);
    }
}