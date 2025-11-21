import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import { isAuthenticated } from "@/lib/authentication";

export async function POST(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const payload = await request.json()

        // FIX: Check if payload is Array (multiple files) or Object (single file)
        if (Array.isArray(payload)) {
            // Use insertMany for arrays (from onQueuesEnd)
            await MediaModel.insertMany(payload)
        } else {
            // Fallback for single file uploads if any
            await MediaModel.create(payload)
        }

        return response(true, 200, 'Media uploaded successfully.')

    } catch (error) {
        return catchError(error)
    }
}