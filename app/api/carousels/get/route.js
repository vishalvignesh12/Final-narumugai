import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CarouselModel from "@/models/Carousel.model";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB()

        const searchParams = request.nextUrl.searchParams;
        const isActive = searchParams.get('isActive') !== 'false'; // default to true

        const filter = {}
        
        // Only apply isActive filter if explicitly requested
        if (searchParams.has('isActive')) {
            filter.isActive = isActive
        }
        
        filter.deletedAt = null

        const carousels = await CarouselModel.find(filter)
            .populate('mediaId')
            .sort({ order: 1, createdAt: -1 })
            .lean()

        return response(true, 200, 'Carousels retrieved successfully.', carousels)

    } catch (error) {
        return catchError(error)
    }
}