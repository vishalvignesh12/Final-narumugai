'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Link from 'next/link'
import { useState } from 'react'
import ProductBox from './ProductBox'
import WebsiteBreadcrumb from './WebsiteBreadcrumb'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 12

export default function KurthiMaterialsCollection() {
    const [page, setPage] = useState(0)
    const [categoryFilter, setCategoryFilter] = useState('all')
    const { data, isPending, isError } = useQuery({
        queryKey: ['kurthi-materials', categoryFilter, page],
        queryFn: async () => {
            const { data: result } = await axios.post('/api/shop', {
                start: page * PAGE_SIZE,
                size: PAGE_SIZE,
                categorySlug: categoryFilter === 'all' ? 'kurthi-materials' : categoryFilter
            })
            if (!result.success) throw new Error(result.message || 'Could not load kurthi materials.')
            return result
        },
        placeholderData: keepPreviousData
    })

    const products = data?.products || []
    const totalPages = Math.ceil((data?.meta?.totalRowCount || 0) / PAGE_SIZE)

    return (
        <main className="min-h-screen bg-white">
            <WebsiteBreadcrumb props={{ title: 'Kurthi Collection', links: [{ label: 'Categories', href: '/categories' }, { label: 'Kurthi Collection' }] }} />
            <section className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-14 text-center md:py-20">
                <p className="mb-3 font-semibold uppercase tracking-[0.2em] text-amber-700">Narumugai Collection</p>
                <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Kurthi Collection</h1>
                <p className="mx-auto max-w-2xl text-lg text-gray-600">Browse Kurthis, Gowns, and Chudi Materials. Choose a size to see what is available.</p>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12">
                <div className="mb-8 flex flex-wrap justify-center gap-3" aria-label="Filter by kurthi category">
                    {[
                        { slug: 'all', label: 'All' },
                        { slug: 'kurthis', label: 'Kurthis' },
                        { slug: 'gowns', label: 'Gowns' },
                        { slug: 'chudi-materials', label: 'Chudi Materials' },
                    ].map(filter => (
                        <Button
                            key={filter.slug}
                            type="button"
                            variant={categoryFilter === filter.slug ? 'default' : 'outline'}
                            onClick={() => {
                                setCategoryFilter(filter.slug)
                                setPage(0)
                            }}
                        >
                            {filter.label}
                        </Button>
                    ))}
                </div>
                {isPending ? (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                        {Array.from({ length: PAGE_SIZE }, (_, index) => <ProductBox.Skeleton key={index} />)}
                    </div>
                ) : isError ? (
                    <div className="py-16 text-center">
                        <p className="text-lg text-red-600">Could not load kurthi materials. Please try again.</p>
                    </div>
                ) : products.length ? (
                    <>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                            {products.map(product => <ProductBox key={product._id} product={product} showQuickActions />)}
                        </div>
                        <div className="mt-10 flex items-center justify-center gap-4">
                            <Button variant="outline" onClick={() => setPage(value => Math.max(value - 1, 0))} disabled={page === 0 || isPending}>Previous</Button>
                            <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
                            <Button variant="outline" onClick={() => setPage(value => Math.min(value + 1, totalPages - 1))} disabled={page + 1 >= totalPages || isPending}>Next</Button>
                        </div>
                    </>
                ) : (
                    <div className="py-16 text-center">
                        <h2 className="mb-2 text-2xl font-semibold text-gray-800">No kurthi materials available yet</h2>
                        <p className="mb-6 text-gray-600">Please check back soon for new designs.</p>
                        <Button asChild variant="outline"><Link href="/shop">Browse all products</Link></Button>
                    </div>
                )}
            </section>
        </main>
    )
}
