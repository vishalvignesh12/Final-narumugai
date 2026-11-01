import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";
import { z } from "zod";
import { otpEmail } from "@/email/otpEmail";
import OTPModel from "@/models/Otp.model";
import { generateOTP } from "@/lib/generateOTP";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const validationSchema = zSchema.pick({
            email: true
        }).extend({
            password: z.string()
        })

        const validatedData = validationSchema.safeParse(payload)
        if (!validatedData.success) {
            return response(false, 401, 'Invalid or missing input field.', validatedData.error)
        }

        const { email, password } = validatedData.data

        // get user data 
        const getUser = await UserModel.findOne({ deletedAt: null, email }).select("+password")
        if (!getUser) {
            return response(false, 400, 'Invalid login credentials.')
        }

        // Verify the password before sending account-state-specific responses.
        const isPasswordVerified = await getUser.comparePassword(password)
        if (!isPasswordVerified) {
            return response(false, 400, 'Invalid login credentials.')
        }

        const purpose = getUser.isEmailVerified ? 'LOGIN' : 'EMAIL_VERIFICATION'
        await OTPModel.deleteMany({ email, purpose })
        const otp = generateOTP()
        await OTPModel.create({ email, otp, purpose })
        const emailStatus = await sendMail(
            purpose === 'LOGIN' ? 'Your Narumugai sign-in code' : 'Verify your Narumugai email address',
            email,
            otpEmail(otp)
        )
        if (!emailStatus.success) {
            await OTPModel.deleteMany({ email, purpose })
            return response(false, 500, 'Could not send the verification code. Please try again.')
        }
        return response(true, 200, purpose === 'LOGIN' ? 'Enter the sign-in code sent to your email.' : 'Enter the verification code sent to your email.', { requiresOtp: true, purpose, email })

    } catch (error) {
        return catchError(error)
    }
}
