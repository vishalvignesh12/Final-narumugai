import { z } from 'zod'
import { isAuthenticated } from '@/lib/authentication'
import { connectDB } from '@/lib/databaseConnection'
import { catchError, response } from '@/lib/helperFunction'
import { unlockStock } from '@/lib/inventoryRestore'
import OrderModel from '@/models/Order.model'
import { canTransition, PAYMENT_STATUS_SYNC, TRANSITION_EFFECTS } from '@/lib/orderTransitions'

const updateStatusSchema = z.object({
    _id: z.string().length(24),
    status: z.enum(['pending-payment', 'processing', 'shipped', 'delivered', 'cancel-requested', 'cancelled', 'failed', 'refunded']),
    note: z.string().trim().max(500).optional()
})

export async function PUT(request) {
    let session
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) return response(false, 403, 'Unauthorized.')
        const parsed = updateStatusSchema.safeParse(await request.json())
        if (!parsed.success) return response(false, 400, 'Invalid or missing fields.', parsed.error.flatten())
        await connectDB()

        session = await OrderModel.startSession()
        session.startTransaction()
        const current = await OrderModel.findById(parsed.data._id).session(session)
        if (!current) {
            await session.abortTransaction()
            return response(false, 404, 'Order not found.')
        }
        if (!canTransition(current.status, parsed.data.status)) {
            await session.abortTransaction()
            return response(false, 409, 'Illegal status transition.')
        }

        const update = {
            $set: {
                status: parsed.data.status,
                ...(PAYMENT_STATUS_SYNC[parsed.data.status] ? { payment_status: PAYMENT_STATUS_SYNC[parsed.data.status] } : {})
            },
            $push: {
                statusHistory: {
                    at: new Date(),
                    from: current.status,
                    to: parsed.data.status,
                    actorId: auth.userId,
                    note: parsed.data.note
                }
            }
        }
        const updated = await OrderModel.findOneAndUpdate(
            { _id: current._id, status: current.status },
            update,
            { new: true, session }
        )
        if (!updated) throw new Error('Order changed while updating status.')

        if (TRANSITION_EFFECTS[parsed.data.status]?.restoreStock && current.payment_status === 'paid') {
            await unlockStock(updated, session)
        }
        await session.commitTransaction()
        return response(true, 200, 'Order status updated successfully.', updated)
    } catch (error) {
        if (session?.inTransaction()) await session.abortTransaction()
        return catchError(error)
    } finally {
        await session?.endSession()
    }
}
