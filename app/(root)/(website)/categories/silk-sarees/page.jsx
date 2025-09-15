import { Metadata } from 'next'
import React from 'react'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import CategoryPageClient from '@/components/Application/Website/CategoryPageClient'

export const metadata = {
    title: 'Premium Silk Sarees Online | Traditional & Designer Silk Sarees | Narumugai',
    description: 'Discover our exquisite collection of premium silk sarees including Banarasi, Kanjivaram, Mysore silk sarees. Authentic handwoven silk sarees with intricate designs for weddings and special occasions.',
    keywords: 'silk sarees, Banarasi sarees, Kanjivaram sarees, Mysore silk, handwoven silk sarees, wedding silk sarees, traditional silk sarees, designer silk sarees',
    openGraph: {
        title: 'Premium Silk Sarees Online | Traditional & Designer Silk Sarees | Narumugai',
        description: 'Discover our exquisite collection of premium silk sarees including Banarasi, Kanjivaram, Mysore silk sarees.',
        type: 'product.group',
        url: 'https://narumugai.com/categories/silk-sarees',
        images: [
            {
                url: 'https://narumugai.com/images/silk-sarees-collection.jpg',
                width: 1200,
                height: 630,
                alt: 'Premium Silk Sarees Collection - Narumugai'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Premium Silk Sarees Online | Traditional & Designer Silk Sarees | Narumugai',
        description: 'Discover our exquisite collection of premium silk sarees including Banarasi, Kanjivaram, Mysore silk sarees.'
    },
    alternates: {
        canonical: 'https://narumugai.com/categories/silk-sarees'
    }
}

const breadcrumb = {
    title: 'Silk Sarees',
    links: [
        { label: 'Shop', href: '/shop' },
        { label: 'Silk Sarees', href: '/categories/silk-sarees' }
    ]
}

const categoryInfo = {
    title: 'Premium Silk Sarees Collection',
    subtitle: 'Handwoven Elegance & Traditional Craftsmanship',
    description: 'Discover our curated collection of premium silk sarees featuring authentic Banarasi, Kanjivaram, and Mysore silk sarees. Each piece is carefully selected for its quality, craftsmanship, and timeless beauty.',
    features: [
        'Authentic handwoven silk sarees',
        'Traditional weaving techniques',
        'Premium quality silk fabric',
        'Intricate zari work and designs',
        'Perfect for weddings and celebrations',
        'Certificate of authenticity included'
    ],
    subcategories: [
        { name: 'Banarasi Silk Sarees', count: '120+', description: 'Traditional Banarasi weaves with gold zari' },
        { name: 'Kanjivaram Silk Sarees', count: '80+', description: 'South Indian temple border designs' },
        { name: 'Mysore Silk Sarees', count: '60+', description: 'Lightweight silk with elegant drape' },
        { name: 'Tussar Silk Sarees', count: '45+', description: 'Natural textured silk sarees' },
        { name: 'Art Silk Sarees', count: '90+', description: 'Affordable silk-like finish sarees' },
        { name: 'Patola Silk Sarees', count: '25+', description: 'Double ikat weave technique' }
    ]
}

const SilkSareesPage = () => {
    return (
        <div>
            {/* Structured Data for Silk Sarees Category */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "Silk Sarees Collection - Narumugai",
                        "description": "Premium collection of silk sarees including Banarasi, Kanjivaram, and Mysore silk sarees",
                        "url": "https://narumugai.com/categories/silk-sarees",
                        "mainEntity": {
                            "@type": "ItemList",
                            "name": "Silk Saree Types",
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
                                    "name": "Silk Sarees",
                                    "item": "https://narumugai.com/categories/silk-sarees"
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
                categoryType="silk"
                filterParams="material=silk"
            />
        </div>
    )
}

export default SilkSareesPage