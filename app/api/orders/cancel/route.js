import { z } from 'zod';
import { isAuthenticated } from '@/lib/authentication';
import { connectDB } from '@/lib/databaseConnection';
import { catchError, response } from '@/lib/helperFunction';
import OrderModel from '@/models/Order.model';
import { unlockStock } from '@/lib/inventoryRestore';

const cancelOrderSchema = z.object({
  orderId: z.string().length(24, 'Invalid order ID format'),
  reason: z.string().trim().min(1, 'Cancellation reason is required').max(500, 'Reason too long'),
});

export async function PUT(request) {
  let session;
  try {
    const auth = await isAuthenticated('user');
    if (!auth.isAuth) return response(false, 401, 'Unauthorized.');

    const parsed = cancelOrderSchema.safeParse(await request.json());
    if (!parsed.success) return response(false, 400, 'Invalid or missing fields.', parsed.error.flatten());
    await connectDB();

    const { orderId, reason } = parsed.data;
    session = await OrderModel.startSession();
    session.startTransaction();

    // Claim the state transition first so repeat requests cannot restore stock twice.
    const existing = await OrderModel.findOne({ _id: orderId, user: auth.userId, deletedAt: null }).session(session)
    if (!existing || !['pending-payment', 'processing'].includes(existing.status)) {
      await session.abortTransaction();
      return response(false, 409, 'This order cannot be cancelled in its current state.');
    }

    if (existing.status === 'processing') {
      const requested = await OrderModel.findOneAndUpdate(
        { _id: existing._id, status: 'processing', payment_status: 'paid' },
        {
          $set: { status: 'cancel-requested', cancellationReason: reason, cancelledAt: new Date(), cancelledBy: auth.userId },
          $push: { statusHistory: { at: new Date(), from: 'processing', to: 'cancel-requested', actorId: auth.userId, note: reason } }
        },
        { new: true, session }
      )
      if (!requested) throw new Error('Order changed while requesting cancellation.')
      await session.commitTransaction()
      return response(true, 200, 'Cancellation requested. Our team will process your refund.')
    }

    const order = await OrderModel.findOneAndUpdate(
      { _id: existing._id, status: 'pending-payment', payment_status: 'pending' },
      {
        $set: { status: 'cancelled', cancellationReason: reason, cancelledAt: new Date(), cancelledBy: auth.userId },
        $push: { statusHistory: { at: new Date(), from: 'pending-payment', to: 'cancelled', actorId: auth.userId, note: reason } }
      },
      { new: true, session },
    )
    if (!order) throw new Error('Order changed while cancelling.')
    await unlockStock(order, session);

    await session.commitTransaction();
    return response(true, 200, 'Order cancelled successfully. Inventory has been restored.');
  } catch (error) {
    if (session?.inTransaction()) await session.abortTransaction();
    return catchError(error);
  } finally {
    await session?.endSession();
  }
}
