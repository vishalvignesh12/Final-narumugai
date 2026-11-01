import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";
import PasswordResetTokenModel from "@/models/PasswordResetToken.model";
import { createHash } from "node:crypto";
import { z } from "zod";

export async function PUT(request) {
    try {
        await connectDB()
        const payload = await request.json()
        const validationSchema = z.object({
            token: z.string().min(40).max(100),
            password: zSchema.shape.password
        })

        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 401, 'Invalid or missing input field.', validatedData.error)
        }

        const { token, password } = validatedData.data
        const tokenHash = createHash('sha256').update(token).digest('hex')
        const resetToken = await PasswordResetTokenModel.findOneAndUpdate(
            { tokenHash, consumedAt: null, expiresAt: { $gt: new Date() } },
            { $set: { consumedAt: new Date() } },
            { new: true }
        )
        if (!resetToken) return response(false, 400, 'This password reset link is invalid or expired. Request a new one.')

        const getUser = await UserModel.findOne({ _id: resetToken.userId, deletedAt: null }).select('+password')
        if (!getUser) return response(false, 400, 'This password reset link is invalid or expired. Request a new one.')

        getUser.password = password
        await getUser.save()

        return response(true, 200, 'Password update success.')
    } catch (error) {
        return catchError(error)
    }
}
