import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema({
    mediaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        required: true
    },
    title: {
        type: String,
        trim: true
    },
    alt: {
        type: String,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    position: {
        type: String,
        enum: ['header', 'footer', 'sidebar', 'homepage-top', 'homepage-middle', 'homepage-bottom'],
        default: 'homepage-top'
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    deletedAt: {
        type: Date,
        default: null,
        index: true
    },
}, { timestamps: true })

const BannerModel = mongoose.models.Banner || mongoose.model('Banner', bannerSchema, 'banners')
export default BannerModel