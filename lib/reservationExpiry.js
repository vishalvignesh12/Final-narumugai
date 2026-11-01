import OrderModel from '@/models/Order.model'
import { unlockStock } from '@/lib/inventoryRestore'

export async function expireStaleReservations({ now = new Date(), session = null } = {}) {
    const candidates = await OrderModel.find({
        status: 'pending-payment',
        reservationExpiresAt: { $lt: now }
    }).select('_id').session(session).lean()

    let expiredCount = 0
    for (const candidate of candidates) {
        const order = await OrderModel.findOneAndUpdate(
            { _id: candidate._id, status: 'pending-payment', reservationExpiresAt: { $lt: now } },
            { $set: { status: 'failed', payment_status: 'failed', cancellationReason: 'Reservation expired.' } },
            { new: true, session }
        )
        if (!order) continue
        await unlockStock(order, session)
        expiredCount += 1
    }
    return { expiredCount }
}
