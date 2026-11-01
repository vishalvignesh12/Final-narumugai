import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CheckCircle, Package, ArrowRight, Home, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { connectDB } from '@/lib/databaseConnection'
import OrderModel from '@/models/Order.model'

export default async function PaymentSuccess({ searchParams }) {
    const params = await searchParams
    const orderId = params?.orderId
    const transactionId = params?.transactionId

    await connectDB()
    const order = await OrderModel.findOne({
        order_id: orderId,
        ...(transactionId ? { transaction_id: transactionId } : {})
    }).select('status payment_status totalAmount order_id transaction_id').lean()

    if (!order || order.payment_status !== 'paid') {
        redirect('/payment-failure?error=unverified_payment')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8 animate-in zoom-in duration-500">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6 animate-bounce">
                        <CheckCircle className="w-16 h-16 text-green-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Payment Successful! 🎉</h1>
                    <p className="text-xl text-gray-600">Thank you for your purchase. Your order has been confirmed.</p>
                </div>

                <Card className="mb-6 shadow-xl animate-in slide-in-from-bottom-4 duration-700">
                    <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b">
                            <Package className="w-6 h-6 text-green-600" />
                            <h2 className="text-2xl font-semibold text-gray-900">Order Details</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-3 border-b">
                                <span className="text-gray-600 font-medium">Order ID</span>
                                <span className="text-gray-900 font-semibold">{order.order_id}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 border-b">
                                <span className="text-gray-600 font-medium">Transaction ID</span>
                                <span className="text-gray-900 font-semibold">{order.transaction_id}</span>
                            </div>
                            <div className="flex justify-between items-center py-3">
                                <span className="text-gray-600 font-medium">Amount Paid</span>
                                <span className="text-2xl font-bold text-green-600">
                                    ₹{Number(order.totalAmount).toLocaleString('en-IN')}
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

                <div className="grid md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-6 duration-1000">
                    <Link href="/orders" className="block">
                        <Button className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white">
                            <Package className="w-5 h-5 mr-2" /> View Order Details <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/shop" className="block">
                        <Button variant="outline" className="w-full h-14 text-lg border-2 hover:bg-gray-50">
                            <ShoppingBag className="w-5 h-5 mr-2" /> Continue Shopping
                        </Button>
                    </Link>
                </div>

                <div className="text-center mt-6">
                    <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                        <Home className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}
