import React from 'react'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { WEBSITE_SHIPPING_POLICY } from '@/routes/WebsiteRoute'

const breadcrumb = {
    title: 'Shipping Policy',
    links: [
        { label: 'Shipping Policy', href: WEBSITE_SHIPPING_POLICY }
    ]
}

export const metadata = {
    title: 'Shipping Policy - Narumugai Sarees',
    description: 'Learn about our shipping policy, delivery timelines, and shipping charges for sarees across India. Fast and reliable delivery.',
    keywords: 'shipping policy, delivery, shipping charges, saree delivery, narumugai shipping'
}

const ShippingPolicy = () => {
    return (
        <div>
            <WebsiteBreadcrumb props={breadcrumb} />
            
            <section className='lg:px-32 md:px-8 px-4 my-10 lg:my-16'>
                <div className='max-w-4xl mx-auto'>
                    <h1 className='text-4xl font-bold mb-6 text-gray-800'>Shipping Policy</h1>
                    
                    <p className='text-gray-600 text-lg mb-6'>
                        At Narumugai Saree Store, we are committed to delivering your beautiful sarees safely and on time. 
                        Please read our shipping policy to understand our delivery process.
                    </p>

                    <div className='bg-blue-50 border-l-4 border-blue-500 p-4 mb-6'>
                        <p className='text-blue-700'>
                            <strong>Important:</strong> For detailed shipping terms and conditions, please also refer to our 
                            <a href="https://merchant.razorpay.com/policy/RIgEbrrWrD7Wl7/shipping" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className='text-blue-600 hover:text-blue-800 ml-1 underline'>
                                Razorpay Shipping Policy
                            </a>
                        </p>
                    </div>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Shipping Areas</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>We deliver across India to all major cities and towns</li>
                        <li>Remote areas may require additional 1-2 days for delivery</li>
                        <li>International shipping is currently not available</li>
                        <li>Same-day delivery available in select metro cities</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Delivery Timeframes</h2>
                    <div className='grid md:grid-cols-2 gap-6 mt-4'>
                        <div className='border rounded-lg p-4'>
                            <h3 className='font-semibold text-lg mb-2 text-gray-800'>Standard Delivery</h3>
                            <ul className='text-gray-600 space-y-1'>
                                <li>• Metro Cities: 2-3 business days</li>
                                <li>• Major Cities: 3-5 business days</li>
                                <li>• Other Areas: 5-7 business days</li>
                            </ul>
                        </div>
                        <div className='border rounded-lg p-4'>
                            <h3 className='font-semibold text-lg mb-2 text-gray-800'>Express Delivery</h3>
                            <ul className='text-gray-600 space-y-1'>
                                <li>• Metro Cities: 1-2 business days</li>
                                <li>• Major Cities: 2-3 business days</li>
                                <li>• Express charges apply</li>
                            </ul>
                        </div>
                    </div>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Shipping Charges</h2>
                    <div className='bg-green-50 border rounded-lg p-4 mb-4'>
                        <p className='text-green-700 font-semibold'>FREE SHIPPING on orders above ₹999!</p>
                    </div>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>Orders below ₹999: ₹99 shipping charges</li>
                        <li>Express delivery: Additional ₹149</li>
                        <li>Same-day delivery (select cities): Additional ₹249</li>
                        <li>Cash on Delivery (COD): Additional ₹49</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Order Processing</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>Orders are processed within 24 hours of payment confirmation</li>
                        <li>Orders placed on weekends/holidays will be processed on the next business day</li>
                        <li>You will receive a tracking number once your order is dispatched</li>
                        <li>Custom orders may require additional 2-3 days for processing</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Packaging</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>All sarees are carefully packed in protective packaging</li>
                        <li>Silk sarees receive special premium packaging</li>
                        <li>Eco-friendly packaging materials are used wherever possible</li>
                        <li>Each package includes care instructions for your sarees</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Delivery Instructions</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>Please ensure someone is available at the delivery address</li>
                        <li>Valid ID proof may be required for delivery verification</li>
                        <li>In case of absence, delivery will be attempted again the next business day</li>
                        <li>Packages will be returned after 3 failed delivery attempts</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Order Tracking</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>Tracking information will be sent via SMS and email</li>
                        <li>You can track your order in the "My Orders" section</li>
                        <li>Real-time updates available through our tracking system</li>
                        <li>Customer support available for tracking queries</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Special Circumstances</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>Delivery may be delayed during festivals, natural disasters, or force majeure events</li>
                        <li>Remote locations may require additional handling time</li>
                        <li>Address changes after order placement may cause delivery delays</li>
                        <li>We are not responsible for delays caused by courier services beyond our control</li>
                    </ul>

                    <div className='bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-8'>
                        <h3 className='font-semibold text-gray-800 mb-2'>Need Help?</h3>
                        <p className='text-gray-600'>
                            For any shipping-related queries, please contact our customer support at:
                        </p>
                        <ul className='text-gray-600 mt-2'>
                            <li>📧 Email: support@narumugai.com</li>
                            <li>📞 Phone: +91-9884585989</li>
                            <li>🕒 Support Hours: 9 AM - 6 PM (Mon-Sat)</li>
                        </ul>
                    </div>

                    <p className='text-sm text-gray-500 mt-8 pt-4 border-t'>
                        This shipping policy was last updated on {new Date().toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}. We reserve the right to update this policy at any time.
                    </p>
                </div>
            </section>
        </div>
    )
}

export default ShippingPolicy