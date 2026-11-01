import { connectDB } from '@/lib/databaseConnection'
import { catchError, response } from '@/lib/helperFunction'
import { zSchema } from '@/lib/zodSchema'
import OtpModel from '@/models/Otp.model'
import UserModel from '@/models/User.model'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'
import { z } from 'zod'

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()
        const validation = zSchema.pick({ email: true, otp: true }).extend({
            purpose: z.enum(['LOGIN', 'EMAIL_VERIFICATION']).default('LOGIN')
        }).safeParse(payload)
        if (!validation.success) return response(false, 400, 'Enter your email and the 6-digit code.')

        const { email, otp, purpose } = validation.data
        const otpRecord = await OtpModel.findOne({ email, otp, purpose, expiresAt: { $gt: new Date() } })
        if (!otpRecord) return response(false, 400, 'The code is invalid or expired. Request a new code.')

        const user = await UserModel.findOne({ email, deletedAt: null })
        if (!user) return response(false, 400, 'The code is invalid or expired. Request a new code.')

        await otpRecord.deleteOne()
        if (purpose === 'EMAIL_VERIFICATION') {
            user.isEmailVerified = true
            await user.save()
            return response(true, 200, 'Email verified successfully.', { emailVerified: true })
        }

        if (!user.isEmailVerified) return response(false, 403, 'Verify your email before signing in.')

        const userData = {
            _id: user._id.toString(),
            role: user.role,
            name: user.name,
            email: user.email,
            phone: user.phone,
            avatar: user.avatar,
        }
        const secret = new TextEncoder().encode(process.env.SECRET_KEY)
        const token = await new SignJWT(userData)
            .setIssuedAt()
            .setExpirationTime('24h')
            .setProtectedHeader({ alg: 'HS256' })
            .sign(secret)
        const cookieStore = await cookies()
        cookieStore.set({
            name: 'access_token',
            value: token,
            httpOnly: process.env.NODE_ENV === 'production',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
        })
        return response(true, 200, 'Login successful.', userData)
    } catch (error) {
        return catchError(error)
    }
}
