import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import SliderModel from "@/models/Slider.model";
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

        const sliders = await SliderModel.find(filter)
            .populate('mediaId')
            .sort({ order: 1, createdAt: -1 })
            .lean()

        return response(true, 200, 'Sliders retrieved successfully.', sliders)

    } catch (error) {
        return catchError(error)
    }
}