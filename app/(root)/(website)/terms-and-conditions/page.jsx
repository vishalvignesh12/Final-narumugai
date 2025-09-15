import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import React from 'react'

export const metadata = {
    title: 'Terms & Conditions | Narumugai Saree Store - Shopping Guidelines',
    description: 'Read the terms and conditions for shopping at Narumugai Saree Store. Understand our policies for saree purchases, returns, exchanges, and customer guidelines.',
    keywords: 'terms and conditions, Narumugai saree store, shopping policy, saree purchase terms, return policy',
    openGraph: {
        title: 'Terms & Conditions | Narumugai Saree Store',
        description: 'Read our terms and conditions for shopping sarees at Narumugai.',
        type: 'website',
        url: 'https://narumugai.com/terms-and-conditions'
    },
    alternates: {
        canonical: 'https://narumugai.com/terms-and-conditions'
    }
}

const breadcrumb = {
    title: 'Terms & Conditions',
    links: [
        { label: 'Terms & Conditions' },
    ]
}

const TermsAndConditions = () => {
    return (
        <div>
            <WebsiteBreadcrumb props={breadcrumb} />
            <div className='lg:px-40 px-5 py-20'>
                <h1 className='text-4xl font-bold mb-6 text-gray-800'>Terms & Conditions</h1>

                <p className='text-gray-600 text-lg mb-6'>Welcome to Narumugai Saree Store. By accessing or using our website to browse or purchase sarees, you agree to be bound by the following terms and conditions. Please read them carefully.</p>

                <p className='mt-3 text-gray-600'>If you do not agree with any part of these terms, please do not use our website or purchase our sarees.</p>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>1. Use of Our Website:</h2>
                <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                    <li>You must be at least 18 years old or visiting under the supervision of a parent or guardian to purchase sarees.</li>
                    <li>You agree to use our website for lawful purposes only and not for any fraudulent or harmful activity.</li>
                    <li>Creating fake accounts or misusing our saree recommendation system is prohibited.</li>
                </ul>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>2. Saree Product Information:</h2>
                <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                    <li>We strive to display accurate saree details, fabric information, prices, and availability, but minor variations may occur.</li>
                    <li>Saree colors may appear different on various devices due to screen settings. We recommend checking our size guide before purchase.</li>
                    <li>We reserve the right to correct any inaccuracies in saree descriptions and update information at any time without prior notice.</li>
                </ul>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>3. Saree Orders & Payments:</h2>
                <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                    <li>Placing a saree order does not guarantee product availability. Orders may be canceled or adjusted if stock is unavailable.</li>
                    <li>All payments for saree purchases must be made through our secure payment gateways. We do not store card information.</li>
                    <li>Prices for sarees are subject to change without notice. The price at the time of order confirmation will be honored.</li>
                    <li>We reserve the right to limit quantities of sarees purchased by a single customer.</li>
                </ul>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>4. Saree Returns & Exchanges:</h2>
                <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                    <li>Sarees can be returned within 7 days of delivery in original condition with tags attached.</li>
                    <li>Custom-stitched or personalized sarees cannot be returned unless defective.</li>
                    <li>Return shipping costs for sarees will be borne by the customer unless the product is defective.</li>
                    <li>Refunds will be processed within 5-7 business days after we receive the returned saree.</li>
                </ul>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>5. Saree Care & Quality:</h2>
                <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                    <li>We provide care instructions for each saree. Following these guidelines is essential for maintaining quality.</li>
                    <li>Natural variations in handwoven sarees are part of their authentic charm and not considered defects.</li>
                    <li>We guarantee the authenticity of all our sarees and provide certificates for premium silk sarees.</li>
                </ul>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>6. Intellectual Property:</h2>
                <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                    <li>All content on Narumugai Saree Store, including logos, saree images, and descriptions, is our property and protected by copyright laws.</li>
                    <li>You may not use, copy, or reproduce any saree images or content without our written consent.</li>
                    <li>Unauthorized use of our trademark "Narumugai" is strictly prohibited.</li>
                </ul>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>7. Shipping & Delivery:</h2>
                <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                    <li>We ship sarees across India with estimated delivery times provided at checkout.</li>
                    <li>Delivery delays due to external factors (weather, strikes, etc.) are beyond our control.</li>
                    <li>International shipping for sarees is available to select countries with additional customs charges.</li>
                </ul>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>8. Limitation of Liability:</h2>
                <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                    <li>We are not liable for any damages resulting from the use or inability to use our website or saree products.</li>
                    <li>Our liability is limited to the purchase price of the saree in question.</li>
                </ul>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>9. Changes to Terms:</h2>
                <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                    <li>We may update these Terms & Conditions at any time. Continued use of the website implies acceptance of the new terms.</li>
                    <li>Significant changes will be communicated via email to registered customers.</li>
                </ul>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Contact Information:</h2>
                <p className='text-gray-600 mb-4'>
                    If you have any questions regarding these terms or need assistance with your saree purchase, please contact our customer support team:
                </p>
                <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                    <p className='text-gray-700'><strong>Email:</strong> support@narumugai.com</p>
                    <p className='text-gray-700'><strong>Phone:</strong> +91-8569874589</p>
                    <p className='text-gray-700'><strong>Business Hours:</strong> Monday - Saturday: 10:00 AM - 8:00 PM</p>
                    <p className='text-gray-700'><strong>Address:</strong> Narumugai Saree Emporium, 123 Fashion Street, Textile Market, Lucknow, Uttar Pradesh 226001</p>
                </div>

                <p className='mt-6 text-gray-600 font-medium'>
                    Thank you for choosing Narumugai Saree Store. We value your trust and are committed to delivering authentic, high-quality sarees with excellent customer service.
                </p>

                <p className='mt-4 text-sm text-gray-500'>
                    Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
        </div>
    )
}

export default TermsAndConditions
