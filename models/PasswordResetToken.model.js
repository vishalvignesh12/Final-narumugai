import mongoose from 'mongoose'

const passwordResetTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    tokenHash: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 }
    },
    consumedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

const PasswordResetTokenModel = mongoose.models.PasswordResetToken || mongoose.model('PasswordResetToken', passwordResetTokenSchema, 'passwordresettokens')
export default PasswordResetTokenModel
