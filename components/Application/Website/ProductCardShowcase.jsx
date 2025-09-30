import React from 'react'
import ProductCard from './ProductCard'

const ProductCardShowcase = () => {
    // Sample product data for demonstration
    const sampleProduct = {
        _id: "sample-1",
        name: "Premium Wireless Headphones with Active Noise Cancellation",
        slug: "premium-wireless-headphones",
        sellingPrice: 2999,
        mrp: 4999,
        isAvailable: true,
        category: {
            _id: "cat-1",
            name: "Electronics",
            slug: "electronics"
        },
        media: [{
            secure_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
            alt: "Premium Wireless Headphones"
        }]
    }

    const sampleProductSoldOut = {
        ...sampleProduct,
        _id: "sample-2",
        name: "Limited Edition Gaming Mouse",
        isAvailable: false,
        sellingPrice: 1999,
        mrp: 2999,
        category: {
            _id: "cat-2",
            name: "Gaming",
            slug: "gaming"
        },
        media: [{
            secure_url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
            alt: "Gaming Mouse"
        }]
    }

    const sampleProductNoDiscount = {
        ...sampleProduct,
        _id: "sample-3",
        name: "Minimalist Desk Lamp",
        sellingPrice: 1999,
        mrp: 1999, // No discount
        category: {
            _id: "cat-3",
            name: "Home & Office",
            slug: "home-office"
        },
        media: [{
            secure_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
            alt: "Desk Lamp"
        }]
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        New Product Card Showcase
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        A modern, responsive product card with multiple variants, smooth animations, 
                        and enhanced user experience features.
                    </p>
                </div>

                {/* Default Variant */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Default Variant</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <ProductCard product={sampleProduct} />
                        <ProductCard product={sampleProductSoldOut} />
                        <ProductCard product={sampleProductNoDiscount} />
                        <ProductCard product={{...sampleProduct, _id: "sample-4", name: "Bluetooth Speaker", category: { _id: "cat-4", name: "Audio", slug: "audio" }}} />
                    </div>
                </section>

                {/* Compact Variant */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Compact Variant</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        <ProductCard product={sampleProduct} variant="compact" />
                        <ProductCard product={sampleProductSoldOut} variant="compact" />
                        <ProductCard product={sampleProductNoDiscount} variant="compact" />
                        <ProductCard product={{...sampleProduct, _id: "sample-5", name: "Smart Watch", category: { _id: "cat-5", name: "Wearables", slug: "wearables" }}} variant="compact" />
                        <ProductCard product={{...sampleProduct, _id: "sample-6", name: "Phone Case", category: { _id: "cat-6", name: "Accessories", slug: "accessories" }}} variant="compact" />
                    </div>
                </section>

                {/* Featured Variant */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured Variant</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ProductCard product={sampleProduct} variant="featured" />
                        <ProductCard product={sampleProductNoDiscount} variant="featured" />
                        <ProductCard product={{...sampleProduct, _id: "sample-7", name: "Premium Coffee Maker", category: { _id: "cat-7", name: "Kitchen", slug: "kitchen" }}} variant="featured" />
                    </div>
                </section>

                {/* Without Quick Actions */}
                <section className="mb-16">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Without Quick Actions</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ProductCard product={sampleProduct} showQuickActions={false} />
                        <ProductCard product={sampleProductSoldOut} showQuickActions={false} />
                        <ProductCard product={sampleProductNoDiscount} showQuickActions={false} />
                        <ProductCard product={{...sampleProduct, _id: "sample-8", name: "Laptop Stand", category: { _id: "cat-8", name: "Office", slug: "office" }}} showQuickActions={false} />
                    </div>
                </section>

                {/* Features List */}
                <section className="bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">Key Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-primary">🎨 Modern Design</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Clean, minimal interface</li>
                                <li>• Smooth hover animations</li>
                                <li>• Gradient overlays and badges</li>
                                <li>• Professional shadows</li>
                            </ul>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-primary">📱 Responsive</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Mobile-first approach</li>
                                <li>• Adaptive image sizing</li>
                                <li>• Touch-friendly interactions</li>
                                <li>• Flexible grid layouts</li>
                            </ul>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-primary">⚡ Performance</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Lazy image loading</li>
                                <li>• Optimized animations</li>
                                <li>• Loading skeletons</li>
                                <li>• Error handling</li>
                            </ul>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-primary">🛠 Variants</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Default - Standard size</li>
                                <li>• Compact - Smaller footprint</li>
                                <li>• Featured - Highlighted products</li>
                                <li>• Customizable styling</li>
                            </ul>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-primary">✨ Interactions</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Quick action buttons</li>
                                <li>• Wishlist integration</li>
                                <li>• Add to cart functionality</li>
                                <li>• Quick view option</li>
                            </ul>
                        </div>
                        
                        <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-primary">🎯 User Experience</h3>
                            <ul className="text-sm text-gray-600 space-y-1">
                                <li>• Clear pricing display</li>
                                <li>• Stock status indicators</li>
                                <li>• Discount badges</li>
                                <li>• Star ratings</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* Usage Examples */}
                <section className="mt-16 bg-gray-900 rounded-2xl p-8 text-white">
                    <h2 className="text-2xl font-semibold mb-6">Usage Examples</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">Basic Usage</h3>
                            <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm">
                                <code>{`<ProductCard product={product} />`}</code>
                            </pre>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">With Variant</h3>
                            <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm">
                                <code>{`<ProductCard product={product} variant="featured" />`}</code>
                            </pre>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">Without Quick Actions</h3>
                            <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm">
                                <code>{`<ProductCard product={product} showQuickActions={false} />`}</code>
                            </pre>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-medium text-gray-300 mb-2">Custom Styling</h3>
                            <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto text-sm">
                                <code>{`<ProductCard 
  product={product} 
  variant="compact"
  className="border-2 border-primary"
/>`}</code>
                            </pre>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

export default ProductCardShowcase