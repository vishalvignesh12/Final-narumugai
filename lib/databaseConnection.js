import mongoose from "mongoose";
const MONGODB_URL = process.env.MONGODB_URI

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = {
        conn: null,
        promise: null,
    }
}

export const connectDB = async () => {
    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        // Extract database name from the MongoDB URL if not specified in connection options
        const dbName = process.env.MONGODB_DB_NAME || 'YT-NEXTJS-ECOMMERCE';
        
        cached.promise = mongoose.connect(MONGODB_URL, {
            dbName: dbName,
            bufferCommands: false
        })
    }

    cached.conn = await cached.promise

    return cached.conn
}