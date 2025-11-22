'use client'
import React from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { XCircle, RefreshCw, Home, HelpCircle, Mail, Phone, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const PaymentFailure = () => {
    const searchParams = useSearchParams()
    const errorMessage = searchParams.get('error') || 'Payment could not be processed'
    const orderId = searchParams.get('orderId') || null

    const commonReasons = [
        'Insufficient funds in your account',
        'Incorrect card details or CVV',
        'Card expired or blocked',
        'Network connectivity issues',
        'Bank declined the transaction',
        'Payment gateway timeout'
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full">
                {/* Error Icon */}
                <div className="text-center mb-8 animate-in zoom-in duration-500">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
                        <XCircle className="w-16 h-16 text-red-600" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Payment Failed
                    </h1>
                    <p className="text-xl text-gray-600">
                        We couldn't process your payment. Don't worry, no amount has been deducted.
                    </p>
                </div>

                {/* Error Details Card */}
                <Card className="mb-6 shadow-xl animate-in slide-in-from-bottom-4 duration-700">
                    <CardContent className="p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-3">Error Details</h2>
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-800">{errorMessage}</p>
                            </div>
                            {orderId && (
                                <p className="text-sm text-gray-600 mt-3">
                                    Reference Order ID: <span className="font-semibold">{orderId}</span>
                                </p>
                            )}
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Reasons for Payment Failure</h3>
                            <ul className="space-y-2">
                                {commonReasons.map((reason, index) => (
                                    <li key={index} className="flex items-start gap-2 text-gray-700">
                                        <span className="text-red-500 mt-1">•</span>
                                        <span>{reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="grid md:grid-cols-2 gap-4 mb-6 animate-in slide-in-from-bottom-6 duration-1000">
                    <Link href="/checkout" className="block">
                        <Button className="w-full h-14 text-lg bg-red-600 hover:bg-red-700 text-white">
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Retry Payment
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <Link href="/cart" className="block">
                        <Button variant="outline" className="w-full h-14 text-lg border-2 hover:bg-gray-50">
                            View Cart
                        </Button>
                    </Link>
                </div>

                {/* Help Section */}
                <Card className="mb-6 bg-blue-50 border-blue-200 animate-in fade-in duration-1000 delay-200">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <HelpCircle className="w-6 h-6 text-blue-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Need Help?</h3>
                        </div>
                        <p className="text-gray-700 mb-4">
                            If you continue to experience issues, please contact our support team. We're here to help!
                        </p>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-gray-700">
                                <Mail className="w-5 h-5 text-blue-600" />
                                <a href="mailto:support@narumugaiboutique.com" className="hover:text-blue-600 transition-colors">
                                    support@narumugaiboutique.com
                                </a>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                                <Phone className="w-5 h-5 text-blue-600" />
                                <a href="tel:+911234567890" className="hover:text-blue-600 transition-colors">
                                    +91 123 456 7890
                                </a>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Alternative Payment Methods */}
                <Card className="mb-6 animate-in fade-in duration-1000 delay-300">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Try Alternative Payment Methods</h3>
                        <p className="text-gray-700 mb-4">
                            We accept multiple payment options for your convenience:
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 border rounded-lg text-center hover:border-primary transition-colors cursor-pointer">
                                <p className="text-sm font-medium">Credit Card</p>
                            </div>
                            <div className="p-3 border rounded-lg text-center hover:border-primary transition-colors cursor-pointer">
                                <p className="text-sm font-medium">Debit Card</p>
                            </div>
                            <div className="p-3 border rounded-lg text-center hover:border-primary transition-colors cursor-pointer">
                                <p className="text-sm font-medium">UPI</p>
                            </div>
                            <div className="p-3 border rounded-lg text-center hover:border-primary transition-colors cursor-pointer">
                                <p className="text-sm font-medium">Net Banking</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Home Link */}
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                        <Home className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default PaymentFailure
