import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import BannerModel from "@/models/Banner.model";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB()

        const searchParams = request.nextUrl.searchParams;
        const isActive = searchParams.get('isActive') !== 'false'; // default to true
        const position = searchParams.get('position');

        const filter = {}
        
        // Only apply isActive filter if explicitly requested
        if (searchParams.has('isActive')) {
            filter.isActive = isActive
        }
        
        if (position) {
            filter.position = position
        }
        
        filter.deletedAt = null

        const banners = await BannerModel.find(filter)
            .populate('mediaId')
            .sort({ order: 1, createdAt: -1 })
            .lean()

        return response(true, 200, 'Banners retrieved successfully.', banners)

    } catch (error) {
        return catchError(error)
    }
}