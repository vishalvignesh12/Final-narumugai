'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { showToast } from '@/lib/showToast'
import axios from 'axios'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

const CancelOrderDialog = ({ order, onOrderCancelled }) => {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState('')
    const [cancelling, setCancelling] = useState(false)

    const handleCancel = async () => {
        if (!reason.trim()) {
            showToast('error', 'Please provide a reason for cancellation')
            return
        }

        setCancelling(true)
        try {
            const { data } = await axios.put('/api/orders/cancel', {
                orderId: order._id,
                reason: reason.trim()
            })

            if (data.success) {
                showToast('success', data.message)
                setOpen(false)
                setReason('')
                if (onOrderCancelled) {
                    onOrderCancelled(order._id)
                }
            } else {
                showToast('error', data.message)
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || 'Failed to cancel order')
        } finally {
            setCancelling(false)
        }
    }

    // Only show cancel button for pending and processing orders
    if (!['pending', 'processing'].includes(order.status)) {
        return null
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="destructive" 
                    size="sm"
                    className="text-xs"
                >
                    Cancel Order
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Cancel Order</DialogTitle>
                    <VisuallyHidden>
                        <DialogDescription>
                            Cancel your order and provide a reason for cancellation
                        </DialogDescription>
                    </VisuallyHidden>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                            <strong>Order ID:</strong> {order.order_id}
                        </p>
                        <p className="text-sm text-gray-600">
                            <strong>Total Amount:</strong> {order.totalAmount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </p>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Cancellation *</Label>
                        <Textarea
                            id="reason"
                            placeholder="Please provide a reason for cancelling this order..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500">
                            {reason.length}/500 characters
                        </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> Once cancelled, this order cannot be restored. 
                            The stock will be returned to inventory and refund will be processed according to our refund policy.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end space-x-2">
                    <Button 
                        variant="outline" 
                        onClick={() => setOpen(false)}
                        disabled={cancelling}
                    >
                        Keep Order
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleCancel}
                        disabled={cancelling || !reason.trim()}
                    >
                        {cancelling ? 'Cancelling...' : 'Cancel Order'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CancelOrderDialog