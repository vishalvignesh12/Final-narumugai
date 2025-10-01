import React from 'react'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { WEBSITE_RETURN_POLICY } from '@/routes/WebsiteRoute'

const breadcrumb = {
    title: 'Return & Exchange Policy',
    links: [
        { label: 'Return & Exchange Policy', href: WEBSITE_RETURN_POLICY }
    ]
}

export const metadata = {
    title: 'Return & Exchange Policy - Narumugai Sarees',
    description: 'Learn about our return and exchange policy for sarees. Easy returns, quick exchanges, and hassle-free process for customer satisfaction.',
    keywords: 'return policy, exchange policy, saree return, exchange process, narumugai returns, narumugai exchanges'
}

const ReturnExchangePolicy = () => {
    return (
        <div>
            <WebsiteBreadcrumb props={breadcrumb} />
            
            <section className='lg:px-32 md:px-8 px-4 my-10 lg:my-16'>
                <div className='max-w-4xl mx-auto'>
                    <h1 className='text-4xl font-bold mb-6 text-gray-800'>Return & Exchange Policy</h1>
                    
                    <p className='text-gray-600 text-lg mb-6'>
                        At Narumugai Saree Store, we want you to be completely satisfied with your purchase. 
                        We offer a hassle-free return and exchange process to ensure you get the perfect saree for your needs.
                    </p>

                    <div className='bg-blue-50 border-l-4 border-blue-500 p-4 mb-6'>
                        <p className='text-blue-700'>
                            <strong>Important:</strong> For refund processing details, please also refer to our{' '}
                            <a href="../refund-policy" className='text-blue-600 hover:text-blue-800 ml-1 underline'>
                                Refund Policy
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
                        <li>Items that don't fit properly (for standard sizes)</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Return Conditions</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>Sarees must be in original condition with all tags attached</li>
                        <li>Items should be unworn, unwashed, and without any stains or odors</li>
                        <li>Original packaging and invoice must be included</li>
                        <li>Return request must be initiated within 15 days of delivery</li>
                        <li>Items must be in saleable condition</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Exchange Process</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li><strong>Size Exchanges:</strong> Free exchange for different sizes of the same saree</li>
                        <li><strong>Color Exchanges:</strong> Exchange for different color variants of the same saree</li>
                        <li><strong>Design Exchanges:</strong> Exchange for different sarees subject to price difference</li>
                        <li><strong>One-Time Exchange:</strong> Limited to one exchange per order</li>
                        <li><strong>Same Product Priority:</strong> Same design/color exchanges are processed faster</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Non-Returnable/Non-Exchangeable Items</h2>
                    <div className='bg-red-50 border rounded-lg p-4 mb-4'>
                        <ul className='text-red-700 space-y-1'>
                            <li>• Custom-made or tailored sarees</li>
                            <li>• Intimate wear or undergarments</li>
                            <li>• Sale/clearance items (unless defective)</li>
                            <li>• Items damaged due to misuse or negligence</li>
                            <li>• Sarees with missing tags or packaging</li>
                        </ul>
                    </div>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>How to Initiate a Return or Exchange</h2>
                    <div className='grid md:grid-cols-3 gap-4 mt-4'>
                        <div className='border rounded-lg p-4 text-center'>
                            <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2'>
                                <span className='text-blue-600 font-bold'>1</span>
                            </div>
                            <h3 className='font-semibold mb-2'>Request Process</h3>
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
                            <h3 className='font-semibold mb-2'>Get Exchange</h3>
                            <p className='text-sm text-gray-600'>Receive replacement item or process return within 5-7 business days</p>
                        </div>
                    </div>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Return Packaging Requirements</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li>Use original packaging if available</li>
                        <li>Ensure all accessories and free gifts are included</li>
                        <li>Securely wrap the saree to prevent damage during transit</li>
                        <li>Include a note with order number and return reason</li>
                        <li>Use a reliable shipping service with tracking</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Exchange Options</h2>
                    <div className='grid md:grid-cols-2 gap-6 mt-4'>
                        <div className='border rounded-lg p-4'>
                            <h3 className='font-semibold text-lg mb-3 text-primary'>Direct Exchange</h3>
                            <p className='text-gray-600 text-sm mb-2'>Get the same product in different size/color without any additional payment processing</p>
                            <ul className='list-disc ps-5 text-gray-600 text-sm space-y-1'>
                                <li>Same product, different size/color</li>
                                <li>No additional charges if same price</li>
                                <li>Price difference applied if different priced items</li>
                            </ul>
                        </div>
                        <div className='border rounded-lg p-4'>
                            <h3 className='font-semibold text-lg mb-3 text-primary'>Different Product Exchange</h3>
                            <p className='text-gray-600 text-sm mb-2'>Exchange for different saree with payment adjustments</p>
                            <ul className='list-disc ps-5 text-gray-600 text-sm space-y-1'>
                                <li>Completely different product</li>
                                <li>Pay difference if new item is more expensive</li>
                                <li>Refund difference if new item is cheaper</li>
                            </ul>
                        </div>
                    </div>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Timeline for Processing</h2>
                    <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                        <li><strong>Return Request Processing:</strong> Within 24 hours of request</li>
                        <li><strong>Return Shipment:</strong> Return shipping label sent within 24 hours</li>
                        <li><strong>Exchange Processing:</strong> New item shipped within 3-5 business days after receiving return</li>
                        <li><strong>Return Refunds:</strong> Processed within 5-7 business days after receiving return (separate from exchange)</li>
                    </ul>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Damaged/Defective Items</h2>
                    <div className='bg-orange-50 border rounded-lg p-4'>
                        <ul className='text-orange-700 space-y-2'>
                            <li>• Report damage within 48 hours of delivery</li>
                            <li>• Provide clear photos of the defective item</li>
                            <li>• Immediate replacement or full refund provided</li>
                            <li>• No return shipping charges for defective items</li>
                            <li>• Free expedited processing for defective items</li>
                        </ul>
                    </div>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Size Guide Assistance</h2>
                    <div className='bg-indigo-50 border rounded-lg p-4 mb-4'>
                        <p className='text-indigo-700 mb-2'>
                            <strong>Need help with sizing?</strong> We provide detailed size guides and virtual assistance to help you select the right size before ordering.
                        </p>
                        <ul className='text-indigo-600 text-sm space-y-1'>
                            <li>• Access our size guide on each product page</li>
                            <li>• Contact our fashion consultants for personalized assistance</li>
                            <li>• Free size consultation available via phone or video call</li>
                        </ul>
                    </div>

                    <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Customer Support for Returns & Exchanges</h2>
                    <div className='bg-blue-50 border rounded-lg p-4'>
                        <p className='text-blue-700 mb-2'>
                            Our customer support team is here to assist with your return and exchange process:
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
                            This return and exchange policy applies to purchases made through our website and retail stores. 
                            For exchanges, you may need to pay additional charges if the new item is more expensive than the original purchase.
                        </p>
                    </div>

                    <p className='text-sm text-gray-500 mt-8 pt-4 border-t'>
                        This return & exchange policy was last updated on {new Date().toLocaleDateString('en-IN', { 
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

export default ReturnExchangePolicy