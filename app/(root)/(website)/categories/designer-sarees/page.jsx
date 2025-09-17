import React from 'react'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import CategoryPageClient from '@/components/Application/Website/CategoryPageClient'

export const metadata = {
    title: 'Designer Sarees Online | Latest Designer Saree Collection | Narumugai',
    description: 'Explore our stunning collection of designer sarees featuring contemporary designs, modern patterns, and stylish drapes.',
    keywords: 'designer sarees, modern sarees, contemporary sarees, party wear sarees, stylish sarees',
    category: 'fashion',
    robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1
    },
    openGraph: {
        title: 'Designer Sarees Online | Latest Designer Saree Collection | Narumugai',
        description: 'Explore our stunning collection of designer sarees featuring contemporary designs.',
        type: 'website',
        url: 'https://narumugai.com/categories/designer-sarees',
        siteName: 'Narumugai',
        locale: 'en_IN',
        images: [
            {
                url: '/assets/images/slider-2.png',
                width: 1200,
                height: 630,
                alt: 'Designer Sarees Collection - Contemporary & Modern Styles | Narumugai',
                type: 'image/jpeg'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        site: '@narumugai',
        title: 'Designer Sarees Online | Latest Designer Saree Collection | Narumugai',
        description: 'Explore our stunning collection of designer sarees featuring contemporary designs.'
    },
    alternates: {
        canonical: 'https://narumugai.com/categories/designer-sarees'
    }
}

const breadcrumb = {
    title: 'Designer Sarees',
    links: [
        { label: 'Shop', href: '/shop' },
        { label: 'Designer Sarees', href: '/categories/designer-sarees' }
    ]
}

const categoryInfo = {
    title: 'Designer Sarees Collection',
    subtitle: 'Contemporary Elegance & Modern Style',
    description: 'Discover our curated collection of designer sarees featuring contemporary designs, modern patterns, and stylish drapes perfect for parties and special occasions.',
    features: [
        'Latest fashion trends',
        'Contemporary designs',
        'Premium quality fabrics',
        'Modern draping styles',
        'Party & event perfect',
        'Celebrity inspired looks'
    ],
    subcategories: [
        { name: 'Indo-Western Sarees', count: '80+', description: 'Fusion of traditional and modern styles' },
        { name: 'Cocktail Party Sarees', count: '60+', description: 'Elegant sarees for cocktail parties' },
        { name: 'Pre-Stitched Sarees', count: '45+', description: 'Ready to wear designer sarees' },
        { name: 'Ruffle Sarees', count: '35+', description: 'Trendy ruffle pattern sarees' },
        { name: 'Concept Sarees', count: '25+', description: 'Unique conceptual designs' },
        { name: 'Celebrity Collection', count: '30+', description: 'Celebrity inspired designs' }
    ]
}

const DesignerSareesPage = () => {
    return (
        <div>
            <WebsiteBreadcrumb props={breadcrumb} />
            <CategoryPageClient 
                categoryInfo={categoryInfo}
                categoryType="designer"
                filterParams="category=designer"
            />
        </div>
    )
}

export default DesignerSareesPage