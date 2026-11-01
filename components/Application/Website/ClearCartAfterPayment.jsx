'use client'

import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { clearCart } from '@/store/reducer/cartReducer'

const PENDING_PAYMENT_KEY = 'pending-payu-order-id'

const ClearCartAfterPayment = ({ orderId }) => {
    const dispatch = useDispatch()

    useEffect(() => {
        try {
            if (sessionStorage.getItem(PENDING_PAYMENT_KEY) !== orderId) return

            sessionStorage.removeItem(PENDING_PAYMENT_KEY)
            dispatch(clearCart())
        } catch (error) {
            console.warn('Could not clear the cart after confirmed payment.', error)
        }
    }, [dispatch, orderId])

    return null
}

export default ClearCartAfterPayment
