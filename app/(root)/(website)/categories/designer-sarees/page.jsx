import React from 'react'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import CategoryPageClient from '@/components/Application/Website/CategoryPageClient'

export const metadata = {
    title: 'Designer Sarees Online | Latest Designer Saree Collection | Narumugai',
    description: 'Explore our stunning collection of designer sarees featuring contemporary designs, modern patterns, and stylish drapes.',
    keywords: 'designer sarees, modern sarees, contemporary sarees, party wear sarees, stylish sarees',
    openGraph: {
        title: 'Designer Sarees Online | Latest Designer Saree Collection | Narumugai',
        description: 'Explore our stunning collection of designer sarees featuring contemporary designs.',
        type: 'product.group',
        url: 'https://narumugai.com/categories/designer-sarees'
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