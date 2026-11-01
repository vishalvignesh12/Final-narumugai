import { otpEmail } from "@/email/otpEmail";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import UserModel from "@/models/User.model";
import OTPModel from "@/models/Otp.model";
import { generateOTP } from "@/lib/generateOTP";

export async function POST(request) {
    try {
        await connectDB()
        // validation schema  
        const validationSchema = zSchema.pick({
            name: true, email: true, password: true
        })

        const payload = await request.json()

        const validatedData = validationSchema.safeParse(payload)

        if (!validatedData.success) {
            return response(false, 401, 'Invalid or missing input field.', validatedData.error)
        }

        const { name, email, password } = validatedData.data

        // If registration previously created an unverified account but email
        // delivery failed, let the user request a fresh verification code.
        const existingUser = await UserModel.findOne({ email })
        if (existingUser) {
            if (existingUser.deletedAt || existingUser.isEmailVerified) {
                return response(false, 409, 'This email is already registered. Please sign in.')
            }

            await OTPModel.deleteMany({ email, purpose: 'EMAIL_VERIFICATION' })
            const otp = generateOTP()
            await OTPModel.create({ email, otp, purpose: 'EMAIL_VERIFICATION' })
            const resendStatus = await sendMail('Verify your Narumugai email address', email, otpEmail(otp))
            if (!resendStatus.success) {
                await OTPModel.deleteMany({ email, purpose: 'EMAIL_VERIFICATION' })
                return response(false, 500, 'Could not send the verification code. Please check email configuration and try again.')
            }
            return response(true, 200, 'A new email verification code has been sent.')
        }

        // new registration  
        const NewRegistration = new UserModel({
            name, email, password
        })

        await NewRegistration.save()

        const otp = generateOTP()
        await OTPModel.deleteMany({ email, purpose: 'EMAIL_VERIFICATION' })
        await OTPModel.create({ email, otp, purpose: 'EMAIL_VERIFICATION' })
        const mailStatus = await sendMail('Verify your Narumugai email address', email, otpEmail(otp))
        if (!mailStatus.success) {
            await OTPModel.deleteMany({ email, purpose: 'EMAIL_VERIFICATION' })
            await UserModel.deleteOne({ _id: NewRegistration._id })
            return response(false, 500, 'Could not send the verification code. Please try registering again.')
        }

        return response(true, 200, 'Registration successful. Enter the verification code sent to your email.')

    } catch (error) {
        return catchError(error)
    }
}
