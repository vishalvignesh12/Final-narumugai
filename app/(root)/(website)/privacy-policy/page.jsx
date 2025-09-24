import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import React from 'react'

export const metadata = {
    title: 'Privacy Policy | Narumugai Saree Store - Data Protection & Privacy',
    description: 'Learn about Narumugai Saree Store privacy policy, how we protect your personal information, and our commitment to data security when shopping for sarees online.',
    keywords: 'privacy policy, data protection, Narumugai saree store, online privacy, personal information security',
    openGraph: {
        title: 'Privacy Policy | Narumugai Saree Store',
        description: 'Learn about our privacy policy and data protection practices at Narumugai Saree Store.',
        type: 'website',
        url: 'https://narumugai.com/privacy-policy'
    },
    alternates: {
        canonical: 'https://narumugai.com/privacy-policy'
    }
}

const breadcrumb = {
    title: 'Privacy Policy',
    links: [
        { label: 'Privacy Policy' },
    ]
}

const PrivacyPolicy = () => {
    return (
        <div>
            <WebsiteBreadcrumb props={breadcrumb} />
            <div className='lg:px-40 px-5 py-20'>
                <h1 className='text-4xl font-bold mb-6 text-gray-800'>Privacy Policy</h1>
                <p className='text-gray-600 mb-6 text-lg'>
                    At Narumugai Saree Store, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner when you shop for our premium saree collection.
                </p>

                <p className='mt-3 text-gray-600'>
                    This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website, browse our saree collections, or make a purchase.
                </p>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Information We Collect:</h2>
                <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                    <li><b>Personal Information:</b> Such as your name, email address, phone number, and shipping/billing addresses, provided during account registration or when purchasing sarees.</li>
                    <li><b>Payment Details:</b> Collected securely through encrypted payment gateways for saree purchases.</li>
                    <li><b>Saree Preferences:</b> Your browsing history, favorite saree categories (silk, cotton, designer), and wishlist items to provide personalized recommendations.</li>
                    <li><b>Usage Data:</b> Including your browser type, IP address, pages visited, and time spent browsing our saree collections to help us improve your shopping experience.</li>
                </ul>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>How We Use Your Information:</h2>
                <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                    <li>To process your saree orders and provide dedicated customer support for your purchase.</li>
                    <li>To personalize your saree shopping experience and recommend products based on your preferences.</li>
                    <li>To send order updates, new saree collection announcements, promotional offers, and newsletters (you may opt out at any time).</li>
                    <li>To ensure our website is secure and functioning properly for safe saree shopping.</li>
                    <li>To improve our saree inventory and website based on customer feedback and usage patterns.</li>
                </ul>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Data Protection & Security:</h2>
                <p className='mt-3 text-gray-600'>
                    We implement industry-standard security measures to protect your personal information. All payment transactions for saree purchases are processed through secure, encrypted channels. We do not store credit card information on our servers.
                </p>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Information Sharing:</h2>
                <p className='mt-3 text-gray-600'>
                    We do not sell, rent, or share your personal information with third parties, except when necessary to fulfill your saree order (such as sharing shipping details with delivery partners) or comply with legal obligations.
                </p>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Your Rights:</h2>
                <ul className='list-disc ps-10 mt-3 text-gray-600 space-y-2'>
                    <li>Access and update your personal information through your account dashboard</li>
                    <li>Request deletion of your personal data (subject to legal requirements)</li>
                    <li>Opt out of marketing communications while maintaining account functionality</li>
                    <li>Request a copy of your personal data we have on file</li>
                </ul>

                <h2 className='text-2xl font-semibold mt-8 mb-4 text-gray-800'>Contact Information:</h2>
                <p className='mt-3 text-gray-600'>
                    If you have any questions or concerns regarding our Privacy Policy or how we handle your data while shopping for sarees, please contact our support team:
                </p>
                <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                    <p className='text-gray-700'><strong>Email:</strong> privacy@narumugai.com</p>
                    <p className='text-gray-700'><strong>Phone:</strong> +91-9884585989</p>
                    <p className='text-gray-700'><strong>Address:</strong> Narumugai, No. 426 TI cycles, road, Ambattur, Chennai, Tamil Nadu 600053</p>
                </div>

                <p className='mt-6 text-gray-600'>
                    By using our website and shopping for sarees at Narumugai, you consent to the practices outlined in this Privacy Policy. We may update this policy from time to time, and any changes will be reflected on this page with the updated date.
                </p>

                <p className='mt-4 text-gray-600 font-medium'>
                    Thank you for trusting Narumugai Saree Store. Your privacy is important to us, and we are committed to providing you with a secure and pleasant saree shopping experience.
                </p>

                <p className='mt-4 text-sm text-gray-500'>
                    Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
            </div>
        </div>
    )
}

export default PrivacyPolicy
