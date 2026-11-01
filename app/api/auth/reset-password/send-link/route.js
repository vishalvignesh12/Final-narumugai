import { randomBytes, createHash } from 'node:crypto'
import { passwordResetLink } from '@/email/passwordResetLink'
import { connectDB } from '@/lib/databaseConnection'
import { catchError, response } from '@/lib/helperFunction'
import { getBaseURL } from '@/lib/config'
import { sendMail } from '@/lib/sendMail'
import { zSchema } from '@/lib/zodSchema'
import PasswordResetTokenModel from '@/models/PasswordResetToken.model'
import UserModel from '@/models/User.model'

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()
        const validation = zSchema.pick({ email: true }).safeParse(payload)
        if (!validation.success) return response(false, 400, 'Enter a valid email address.')

        const { email } = validation.data
        const user = await UserModel.findOne({ email, deletedAt: null }).select('_id email').lean()
        if (user) {
            await PasswordResetTokenModel.deleteMany({ userId: user._id, consumedAt: null })
            const token = randomBytes(32).toString('base64url')
            const tokenHash = createHash('sha256').update(token).digest('hex')
            await PasswordResetTokenModel.create({
                userId: user._id,
                tokenHash,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000)
            })

            const mailResult = await sendMail(
                'Reset your Narumugai password',
                user.email,
                passwordResetLink(`${getBaseURL()}/auth/reset-password/${token}`)
            )
            if (!mailResult.success) console.error('Password reset email could not be sent.')
        }

        return response(true, 200, 'If an account exists for that email, a password reset link has been sent.')
    } catch (error) {
        return catchError(error)
    }
}
