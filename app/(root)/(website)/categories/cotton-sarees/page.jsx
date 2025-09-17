import { Metadata } from 'next'
import React from 'react'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import CategoryPageClient from '@/components/Application/Website/CategoryPageClient'

export const metadata = {
    title: 'Cotton Sarees Online | Comfortable Daily Wear Cotton Sarees | Narumugai',
    description: 'Shop premium cotton sarees perfect for daily wear, office, and casual occasions. Breathable, comfortable cotton sarees in traditional and contemporary designs.',
    keywords: 'cotton sarees, daily wear sarees, office wear sarees, comfortable sarees, breathable cotton sarees, casual sarees, traditional cotton sarees',
    openGraph: {
        title: 'Cotton Sarees Online | Comfortable Daily Wear Cotton Sarees | Narumugai',
        description: 'Shop premium cotton sarees perfect for daily wear, office, and casual occasions.',
        type: 'website',
        url: 'https://narumugai.com/categories/cotton-sarees',
        images: [
            {
                url: '/assets/images/slider-4.png',
                width: 1200,
                height: 630,
                alt: 'Cotton Sarees Collection - Narumugai',
                type: 'image/jpeg'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cotton Sarees Online | Comfortable Daily Wear Cotton Sarees | Narumugai',
        description: 'Shop premium cotton sarees perfect for daily wear, office, and casual occasions.'
    },
    alternates: {
        canonical: 'https://narumugai.com/categories/cotton-sarees'
    }
}

const breadcrumb = {
    title: 'Cotton Sarees',
    links: [
        { label: 'Shop', href: '/shop' },
        { label: 'Cotton Sarees', href: '/categories/cotton-sarees' }
    ]
}

const categoryInfo = {
    title: 'Premium Cotton Sarees Collection',
    subtitle: 'Comfort Meets Elegance',
    description: 'Discover our extensive collection of premium cotton sarees designed for comfort and style. Perfect for daily wear, office, and casual occasions with breathable fabric and beautiful designs.',
    features: [
        '100% pure cotton fabric',
        'Breathable and comfortable',
        'Perfect for daily wear',
        'Easy to maintain',
        'Variety of prints and colors',
        'Affordable pricing'
    ],
    subcategories: [
        { name: 'Handloom Cotton Sarees', count: '150+', description: 'Traditional handwoven cotton sarees' },
        { name: 'Printed Cotton Sarees', count: '200+', description: 'Beautiful printed designs and patterns' },
        { name: 'Block Print Cotton Sarees', count: '80+', description: 'Traditional block print techniques' },
        { name: 'Khadi Cotton Sarees', count: '60+', description: 'Pure khadi cotton handspun fabric' },
        { name: 'Organic Cotton Sarees', count: '45+', description: 'Eco-friendly organic cotton' },
        { name: 'Office Wear Cotton Sarees', count: '120+', description: 'Professional and elegant designs' }
    ]
}

const CottonSareesPage = () => {
    return (
        <div>
            {/* Structured Data for Cotton Sarees Category */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "Cotton Sarees Collection - Narumugai",
                        "description": "Premium collection of cotton sarees perfect for daily wear and casual occasions",
                        "url": "https://narumugai.com/categories/cotton-sarees",
                        "mainEntity": {
                            "@type": "ItemList",
                            "name": "Cotton Saree Types",
                            "itemListElement": categoryInfo.subcategories.map((category, index) => ({
                                "@type": "ListItem",
                                "position": index + 1,
                                "name": category.name,
                                "description": category.description
                            }))
                        },
                        "breadcrumb": {
                            "@type": "BreadcrumbList",
                            "itemListElement": [
                                {
                                    "@type": "ListItem",
                                    "position": 1,
                                    "name": "Home",
                                    "item": "https://narumugai.com"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 2,
                                    "name": "Shop",
                                    "item": "https://narumugai.com/shop"
                                },
                                {
                                    "@type": "ListItem",
                                    "position": 3,
                                    "name": "Cotton Sarees",
                                    "item": "https://narumugai.com/categories/cotton-sarees"
                                }
                            ]
                        },
                        "isPartOf": {
                            "@type": "WebSite",
                            "name": "Narumugai",
                            "url": "https://narumugai.com"
                        }
                    })
                }}
            />

            <WebsiteBreadcrumb props={breadcrumb} />
            
            <CategoryPageClient 
                categoryInfo={categoryInfo}
                categoryType="cotton"
                filterParams="material=cotton"
            />
        </div>
    )
}

export default CottonSareesPage