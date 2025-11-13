import mongoose from "mongoose";
import ProductModel from "@/models/Product.model.js";
import ProductVariantModel from "@/models/ProductVariant.model.js";
import MediaModel from "@/models/Media.model.js";
import ReviewModel from "@/models/Review.model.js";
import CategoryModel from "@/models/Category.model.js";
import UserModel from "@/models/User.model.js";
import OrderModel from "@/models/Order.model.js";
import BannerModel from "@/models/Banner.model.js";
import CouponModel from "@/models/Coupon.model.js";
import OtpModel from "@/models/Otp.model.js";
import CarouselModel from "@/models/Carousel.model.js";

const MONGODB_URL = process.env.MONGODB_URI

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    }
}

// Force model registration by accessing them
const allModels = [ProductModel, ProductVariantModel, MediaModel, ReviewModel, CategoryModel, UserModel, OrderModel, BannerModel, CouponModel, OtpModel, CarouselModel];

export const connectDB = async () => {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        // Pre-register all models to avoid MissingSchemaError
        // These imports ensure models are registered before connection
        console.log('Pre-registering models...');   
        
    cached.promise = mongoose.connect(MONGODB_URL, {
        bufferCommands: false
    })
    }

    cached.conn = await cached.promise

    return cached.conn
}