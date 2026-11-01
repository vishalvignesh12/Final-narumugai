import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    discountPercentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    minShoppingAmount: {
        type: Number,
        required: true,
        trim: true,
    },
    validity: {
        type: Date,
        required: true,
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },
    usageLimit: {
        type: Number,
        min: 1,
        default: null
    },
    usedCount: {
        type: Number,
        min: 0,
        default: 0
    },
    perUserLimit: {
        type: Number,
        min: 1,
        default: null
    },
    redemptions: [{
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        at: { type: Date, default: Date.now }
    }]

}, { timestamps: true })


const CouponModel = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema, 'coupons')
export default CouponModel