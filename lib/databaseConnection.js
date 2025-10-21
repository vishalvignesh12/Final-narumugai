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
import SliderModel from "@/models/Slider.model.js";
import logger from "@/lib/logger.js";
import { config } from "@/lib/envConfig.js";

const MONGODB_URL = config.MONGODB_URI

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    }
}

// Force model registration by accessing them
const allModels = [ProductModel, ProductVariantModel, MediaModel, ReviewModel, CategoryModel, UserModel, OrderModel, BannerModel, CouponModel, OtpModel, SliderModel];

export const connectDB = async () => {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        // Pre-register all models to avoid MissingSchemaError
        logger.debug('Pre-registering database models');
        
        const dbName = config.MONGODB_DB_NAME;
        
        cached.promise = mongoose.connect(MONGODB_URL, {
            dbName: dbName,
            bufferCommands: false
        }).then((connection) => {
            logger.info({ dbName }, 'Database connected successfully');
            return connection;
        }).catch((error) => {
            logger.error({ error: error.message, stack: error.stack }, 'Database connection failed');
            throw error;
        });
    }

    cached.conn = await cached.promise

    return cached.conn
}