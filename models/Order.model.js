import { model, models, Schema } from "mongoose";

// This sub-schema defines the structure for products within an order
const productSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variantId: {
        // --- FIX 1: Change type to String ---
        // This allows storing 'null', 'fallback-...' strings, or real ObjectIds as strings
        type: String, 
        
        // --- FIX 2: Make it not required ---
        // This allows 'null' or 'undefined' values.
        required: false, 
        
        // --- FIX 3: Explicitly allow null ---
        default: null 
    },
    name: {
        type: String,
        required: true
    },
    qty: {
        type: Number,
        required: true,
        default: 1
    },
    mrp: {
        type: Number,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true
    }
}, { _id: false }); // No separate _id for sub-documents

const orderSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            // Not all orders must have a user (e.g., guest checkout)
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
            required: true,
        },
        landmark: {
            type: String,
            required: true,
        },
        ordernote: {
            type: String,
        },

        // Array of products included in the order
        products: [productSchema],

        // Payment and pricing details
        subtotal: {
            type: Number,
            required: true,
            default: 0
        },
        discount: {
            type: Number,
            required: true,
            default: 0
        },
        couponDiscountAmount: {
            type: Number,
            required: true,
            default: 0
        },
        totalAmount: {
            type: Number,
            required: true,
            default: 0
        },

        // Order and payment status
        status: {
            type: String,
            enum: [
                'pending-payment',
                'processing',
                'shipped',
                'delivered',
                'cancelled',
                'failed',
                'refunded'
            ],
            default: 'pending-payment',
        },
        
        // Transaction and payment IDs
        transaction_id: {
            type: String,
            unique: true,
            sparse: true // Allows multiple documents to have null/undefined txnid
        },
        order_id: {
            type: String,
            unique: true,
            sparse: true
        },
        payment_id: {
            type: String,
        },
        payment_method: {
            type: String,
        },
        payment_status: {
            type: String,
            default: 'pending'
        },
    },
    {
        timestamps: true,
    }
);

const OrderModel = models.Order || model('Order', orderSchema);
export default OrderModel;