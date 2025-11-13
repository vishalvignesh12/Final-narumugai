import mongoose from "mongoose";

const carouselSchema = new mongoose.Schema({
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

const CarouselModel = mongoose.models.Carousel || mongoose.model('Carousel', carouselSchema, 'carousels')
export default CarouselModel