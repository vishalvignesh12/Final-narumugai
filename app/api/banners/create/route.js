import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import BannerModel from "@/models/Banner.model";
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

        const newBanner = new BannerModel({
            mediaId: payload.mediaId,
            title: payload.title || '',
            alt: payload.alt || '',
            link: payload.link || '',
            position: payload.position || 'homepage-top',
            order: payload.order || 0,
            isActive: payload.isActive !== undefined ? payload.isActive : true
        })

        await newBanner.save()

        return response(true, 200, 'Banner created successfully.', newBanner)

    } catch (error) {
        return catchError(error)
    }
}