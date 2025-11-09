import { orderStatus } from "@/lib/utils"
import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },
    pincode: {
        type: String,
        required: true
    },
    landmark: {
        type: String,
        required: true
    },
    ordernote: {
        type: String,
        required: false
    },

    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            mrp: { type: Number, required: true },
            sellingPrice: { type: Number, required: true },
        }
    ],
    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        required: true
    },
    couponDiscountAmount: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: [...orderStatus, 'pending-payment', 'failed'], // Added new statuses
        default: 'pending-payment'
    },
    // REPLACED Razorpay fields with PayU fields
    payment_gateway_id: { // Will store PayU's mihpayid
        type: String,
        required: false,
        index: true
    },
    transaction_id: { // Will store our unique txnid
        type: String,
        required: true,
        unique: true,
        index: true
    },
    order_id: { // This is your internal order ID, keeping as is
        type: String,
        required: true,
        unique: true,
    },
    // END OF CHANGES
    cancellationReason: {
        type: String,
        required: false
    },
    cancelledAt: {
        type: Date,
        required: false
    },
    cancelledBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },
}, { timestamps: true })

// Add indexes for faster lookups
orderSchema.index({ user: 1 });
orderSchema.index({ email: 1 });
orderSchema.index({ phone: 1 });


const OrderModel = mongoose.models.Order || mongoose.model('Order', orderSchema, 'orders')
export default OrderModel