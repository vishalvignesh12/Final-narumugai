import React from 'react'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { WEBSITE_REFUND_POLICY, WEBSITE_RETURN_POLICY } from '@/routes/WebsiteRoute'

const breadcrumb = {
    title: 'Refund Policy',
    links: [
        { label: 'Refund Policy', href: WEBSITE_REFUND_POLICY }
    ]
}

export const metadata = {
    title: 'Refund Policy - Narumugai Sarees',
    description: 'Learn about our refund and return policy for sarees. Easy returns, quick refunds, and hassle-free exchange process.',
    keywords: 'refund policy, return policy, saree return, refund process, narumugai returns'
}

const RefundPolicy = () => {
    return (
        <div>
            <WebsiteBreadcrumb props={breadcrumb} />
            
            <section className='lg:px-32 md:px-8 px-4 my-10 lg:my-16'>
                <div className='max-w-4xl mx-auto'>
                    <h1 className='text-4xl font-bold mb-6 text-gray-800'>Refund Policy</h1>
                    
                    <p className='text-gray-600 text-lg mb-6'>
                        At Narumugai Saree Store, your satisfaction is our priority. We offer a comprehensive refund and return policy 
                        to ensure you have a pleasant shopping experience with our saree collection.
                    </p>

                    <div className='bg-blue-50 border-l-4 border-blue-500 p-4 mb-6'>
                        <p className='text-blue-700'>
                            <strong>Important:</strong> For detailed refund terms and payment processing information, please also refer to our 
                            <a href={WEBSITE_RETURN_POLICY} 
                               className='text-blue-600 hover:text-blue-800 ml-1 underline'>
                                Return & Exchange Policy
                            </a>
                            {' '}and{' '}
                            <a href="https://merchant.razorpay.com/policy/RIgEbrrWrD7Wl7/refund" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               className='text-blue-600 hover:text-blue-800 ml-1 underline'>
                                Razorpay Refund Policy
                            </a>
                        </p>
                    </div>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Return Window</h2>
                    <div className='bg-green-50 border rounded-lg p-4 mb-4'>
                        <p className='text-green-700 font-semibold'>15-Day Return Policy</p>
                        <p className='text-green-600 text-sm'>You can return or exchange sarees within 15 days of delivery</p>
                    </div>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Eligible Items for Return</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>Sarees with manufacturing defects or damage during shipping</li>
                        <li>Wrong item delivered (different color, design, or size)</li>
                        <li>Sarees not matching the description on our website</li>
                        <li>Quality issues with fabric or stitching</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Return Conditions</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>Sarees must be in original condition with all tags attached</li>
                        <li>Items should be unworn, unwashed, and without any stains or odors</li>
                        <li>Original packaging and invoice must be included</li>
                        <li>Return request must be initiated within 15 days of delivery</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Non-Returnable Items</h2>
                    <div className='bg-red-50 border rounded-lg p-4 mb-4'>
                        <ul className='text-red-700 space-y-1'>
                            <li>• Custom-made or tailored sarees</li>
                            <li>• Intimate wear or undergarments</li>
                            <li>• Sale/clearance items (unless defective)</li>
                            <li>• Items damaged due to misuse or negligence</li>
                        </ul>
                    </div>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>How to Initiate a Return</h2>
                    <div className='grid md:grid-cols-3 gap-4 mt-4'>
                        <div className='border rounded-lg p-4 text-center'>
                            <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2'>
                                <span className='text-blue-600 font-bold'>1</span>
                            </div>
                            <h3 className='font-semibold mb-2'>Request Return</h3>
                            <p className='text-sm text-gray-600'>Contact us via email, phone, or through your account dashboard</p>
                        </div>
                        <div className='border rounded-lg p-4 text-center'>
                            <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2'>
                                <span className='text-blue-600 font-bold'>2</span>
                            </div>
                            <h3 className='font-semibold mb-2'>Pack & Ship</h3>
                            <p className='text-sm text-gray-600'>Pack the item securely and ship using our return label</p>
                        </div>
                        <div className='border rounded-lg p-4 text-center'>
                            <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2'>
                                <span className='text-blue-600 font-bold'>3</span>
                            </div>
                            <h3 className='font-semibold mb-2'>Get Refund</h3>
                            <p className='text-sm text-gray-600'>Receive refund within 5-7 business days after inspection</p>
                        </div>
                    </div>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Refund Methods</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li><strong>Original Payment Method:</strong> Refund processed to the original payment source</li>
                        <li><strong>Bank Transfer:</strong> Direct transfer to your bank account (3-5 business days)</li>
                        <li><strong>Store Credit:</strong> Instant credit for future purchases with additional 5% bonus</li>
                        <li><strong>Cash on Delivery:</strong> Bank transfer after account verification</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Refund Timeline</h2>
                    <div className='bg-gray-50 border rounded-lg p-4'>
                        <ul className='text-gray-700 space-y-2'>
                            <li><strong>Credit/Debit Cards:</strong> 5-7 business days</li>
                            <li><strong>Net Banking:</strong> 3-5 business days</li>
                            <li><strong>UPI/Wallets:</strong> 2-3 business days</li>
                            <li><strong>Bank Transfer:</strong> 3-5 business days</li>
                        </ul>
                        <p className='text-sm text-gray-500 mt-2'>
                            *Timeline may vary depending on your bank's processing time
                        </p>
                    </div>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Exchange Policy</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>Free exchange for size or color variants of the same saree</li>
                        <li>Exchange for different sarees subject to price difference</li>
                        <li>One-time exchange allowed per order</li>
                        <li>Exchange shipping charges may apply for remote locations</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Damaged/Defective Items</h2>
                    <div className='bg-orange-50 border rounded-lg p-4'>
                        <ul className='text-orange-700 space-y-2'>
                            <li>• Report damage within 48 hours of delivery</li>
                            <li>• Provide clear photos of the damaged item</li>
                            <li>• Immediate replacement or full refund provided</li>
                            <li>• No return shipping charges for defective items</li>
                        </ul>
                    </div>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Partial Returns</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>Partial returns allowed for multi-item orders</li>
                        <li>Shipping charges are non-refundable for partial returns</li>
                        <li>Each item evaluated separately for return eligibility</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Refund Processing</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>Quality inspection performed upon receiving returned items</li>
                        <li>Email confirmation sent once refund is processed</li>
                        <li>Refund amount excludes original shipping charges (if any)</li>
                        <li>Detailed refund breakdown provided via email</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Customer Support</h2>
                    <div className='bg-blue-50 border rounded-lg p-4'>
                        <p className='text-blue-700 mb-2'>
                            Our customer support team is here to help with your return process:
                        </p>
                        <ul className='text-blue-600 space-y-1'>
                            <li>📧 Email: returns@narumugai.com</li>
                            <li>📞 Phone: +91-9884585989</li>
                            <li>💬 Live Chat: Available on our website</li>
                            <li>🕒 Hours: 9 AM - 6 PM (Mon-Sat)</li>
                        </ul>
                    </div>

                    <div className='bg-yellow-50 border-l-4 border-yellow-500 p-4 mt-8'>
                        <h3 className='font-semibold text-gray-800 mb-2'>Note</h3>
                        <p className='text-gray-600'>
                            This refund policy applies to purchases made through our website and retail stores. 
                            For purchases made through third-party platforms, their respective return policies may apply.
                        </p>
                    </div>

                    <p className='text-sm text-gray-500 mt-8 pt-4 border-t'>
                        This refund policy was last updated on {new Date().toLocaleDateString('en-IN', { 
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

export default RefundPolicy