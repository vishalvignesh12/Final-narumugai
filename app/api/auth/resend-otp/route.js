import { otpEmail } from '@/email/otpEmail'
import { connectDB } from '@/lib/databaseConnection'
import { catchError, response } from '@/lib/helperFunction'
import { generateOTP } from '@/lib/generateOTP'
import { sendMail } from '@/lib/sendMail'
import { zSchema } from '@/lib/zodSchema'
import OtpModel from '@/models/Otp.model'
import UserModel from '@/models/User.model'
import { z } from 'zod'

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()
        const validation = zSchema.pick({ email: true }).extend({
            purpose: z.enum(['LOGIN', 'EMAIL_VERIFICATION']).optional()
        }).safeParse(payload)
        if (!validation.success) return response(false, 400, 'Enter a valid email address.')

        const { email, purpose: requestedPurpose } = validation.data
        const purpose = requestedPurpose || 'EMAIL_VERIFICATION'
        const user = await UserModel.findOne({ email, deletedAt: null })
        if (!user || (purpose === 'LOGIN' && !user.isEmailVerified) || (purpose === 'EMAIL_VERIFICATION' && user.isEmailVerified)) {
            return response(false, 400, 'Unable to resend a code for this account.')
        }

        await OtpModel.deleteMany({ email, purpose })
        const otp = generateOTP()
        await OtpModel.create({ email, otp, purpose })
        const result = await sendMail(
            purpose === 'LOGIN' ? 'Your Narumugai sign-in code' : 'Verify your Narumugai email address',
            email,
            otpEmail(otp)
        )
        if (!result.success) {
            await OtpModel.deleteMany({ email, purpose })
            return response(false, 500, 'Could not send the code. Please try again.')
        }
        return response(true, 200, 'A new code has been sent to your email.')
    } catch (error) {
        return catchError(error)
    }
}
