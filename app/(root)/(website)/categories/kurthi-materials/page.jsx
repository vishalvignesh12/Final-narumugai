import KurthiMaterialsCollection from '@/components/Application/Website/KurthiMaterialsCollection'

export const metadata = {
    title: 'Kurthi Collection | Narumugai',
    description: 'Shop Kurthis, Gowns, and Chudi Materials from Narumugai.',
    alternates: {
        canonical: 'https://narumugai.com/categories/kurthi-materials'
    },
    openGraph: {
        title: 'Kurthi Collection | Narumugai',
        description: 'Shop Kurthis, Gowns, and Chudi Materials from Narumugai.',
        type: 'website',
        url: 'https://narumugai.com/categories/kurthi-materials'
    }
}

export default function KurthiMaterialsPage() {
    return <KurthiMaterialsCollection />
}
