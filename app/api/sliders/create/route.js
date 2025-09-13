import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import SliderModel from "@/models/Slider.model";
import { isAuthenticated } from "@/lib/authentication";

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const payload = await request.json()
        
        // Validate required fields
        if (!payload.mediaId) {
            return response(false, 400, 'Media ID is required.')
        }

        const newSlider = new SliderModel({
            mediaId: payload.mediaId,
            title: payload.title || '',
            alt: payload.alt || '',
            link: payload.link || '',
            order: payload.order || 0,
            isActive: payload.isActive !== undefined ? payload.isActive : true
        })

        await newSlider.save()

        return response(true, 200, 'Slider created successfully.', newSlider)

    } catch (error) {
        return catchError(error)
    }
}