'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Package, ArrowRight, Home, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const PaymentSuccess = () => {
    const searchParams = useSearchParams()
    const [orderDetails, setOrderDetails] = useState({
        orderId: searchParams.get('orderId') || 'N/A',
        transactionId: searchParams.get('transactionId') || 'N/A',
        amount: searchParams.get('amount') || '0'
    })

    useEffect(() => {
        // Confetti animation on mount
        const duration = 3 * 1000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min
        }

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now()

            if (timeLeft <= 0) {
                return clearInterval(interval)
            }

            const particleCount = 50 * (timeLeft / duration)
        }, 250)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Success Icon Animation */}
                <div className="text-center mb-8 animate-in zoom-in duration-500">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
                        <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Payment Successful! 🎉
                    </h1>
                    <p className="text-xl text-gray-600">
                        Thank you for your purchase. Your order has been confirmed.
                    </p>
                </div>

                {/* Order Details Card */}
                <Card className="mb-6 shadow-xl animate-in slide-in-from-bottom-4 duration-700">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                            <Package className="w-6 h-6 text-green-600" />
                            <h2 className="text-2xl font-semibold text-gray-900">Order Details</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b">
                                <span className="text-gray-600 font-medium">Order ID</span>
                                <span className="text-gray-900 font-semibold">{orderDetails.orderId}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b">
                                <span className="text-gray-600 font-medium">Transaction ID</span>
                                <span className="text-gray-900 font-semibold">{orderDetails.transactionId}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-gray-600 font-medium">Amount Paid</span>
                                <span className="text-2xl font-bold text-green-600">
                                    ₹{parseFloat(orderDetails.amount).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>

                        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800">
                                <strong>📧 Confirmation Email Sent!</strong><br />
                                We've sent an order confirmation to your email address with all the details.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-6 duration-1000">
                    <Link href="/orders" className="block">
                        <Button className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white">
                            <Package className="w-5 h-5 mr-2" />
                            View Order Details
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/shop" className="block">
                        <Button variant="outline" className="w-full h-14 text-lg border-2 hover:bg-gray-50">
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Continue Shopping
                        </Button>
                    </Link>
                </div>

                {/* Home Link */}
                <div className="text-center mt-6">
                    <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                        <Home className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                </div>

                {/* What's Next Section */}
                <Card className="mt-8 bg-white/50 backdrop-blur animate-in fade-in duration-1000 delay-300">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">What happens next?</h3>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-sm font-bold">1</span>
                                </div>
                                <p className="text-gray-700">We'll process your order and prepare it for shipping</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-sm font-bold">2</span>
                                </div>
                                <p className="text-gray-700">You'll receive tracking information via email once shipped</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-sm font-bold">3</span>
                                </div>
                                <p className="text-gray-700">Your beautiful saree will arrive at your doorstep soon!</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default PaymentSuccess
