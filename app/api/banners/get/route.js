import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import BannerModel from "@/models/Banner.model";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB()

        const searchParams = request.nextUrl.searchParams;
        const isActive = searchParams.get('isActive');
        const position = searchParams.get('position');
        const page = parseInt(searchParams.get('page') || '0', 10);
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        const filter = {}
        
        // Only apply isActive filter if explicitly requested
        if (isActive !== null) {
            filter.isActive = isActive === 'true'
        }
        
        if (position) {
            filter.position = position
        }
        
        filter.deletedAt = null

        const totalCount = await BannerModel.countDocuments(filter)
        const skip = page * limit
        const hasMore = totalCount > skip + limit

        const banners = await BannerModel.find(filter)
            .populate('mediaId')
            .sort({ order: 1, createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()

        return response(true, 200, 'Banners retrieved successfully.', {
            banners,
            totalCount,
            hasMore,
            currentPage: page
        })

    } catch (error) {
        return catchError(error)
    }
}