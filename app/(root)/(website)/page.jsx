'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Star, Heart, ShoppingBag, Truck, Shield, Headphones, Award, ArrowRight, Play, Users, Sparkles } from 'lucide-react'
import { FaInstagram, FaWhatsapp, FaFacebook } from 'react-icons/fa'
import axios from 'axios'
import WishlistButton from '@/components/Application/Website/WishlistButton'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'

const Home = () => {
    const [featuredProducts, setFeaturedProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentTestimonial, setCurrentTestimonial] = useState(0)

    const testimonials = [
        {
            name: "Priya Sharma",
            location: "Mumbai",
            rating: 5,
            text: "Absolutely gorgeous sarees! The quality is exceptional and the customer service is outstanding. My go-to place for traditional wear.",
            image: "/api/placeholder/60/60"
        },
        {
            name: "Anita Gupta",
            location: "Delhi",
            rating: 5,
            text: "Beautiful collection with authentic designs. Fast delivery and excellent packaging. Highly recommended for saree lovers!",
            image: "/api/placeholder/60/60"
        },
        {
            name: "Meera Reddy",
            location: "Bangalore",
            rating: 5,
            text: "The silk sarees are pure luxury! Perfect for weddings and festivals. The craftsmanship is truly remarkable.",
            image: "/api/placeholder/60/60"
        }
    ]

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('/api/product/get-featured-product')
                if (data.success) {
                    setFeaturedProducts(data.data.slice(0, 8))
                }
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()

        // Auto-rotate testimonials
        const interval = setInterval(() => {
            setCurrentTestimonial(prev => (prev + 1) % testimonials.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    // Structured data for SEO
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Narumugai - Premium Sarees Online",
        "description": "Shop exquisite collection of traditional and designer sarees",
        "url": "https://narumugai.com"
    }

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10"></div>
                <div className="relative z-10 text-center max-w-6xl mx-auto px-4">
                    <div className="mb-8">
                        <span className="inline-flex items-center px-4 py-2 rounded-full bg-pink-100 text-pink-800 text-sm font-medium mb-6">
                            <Sparkles className="w-4 h-4 mr-2" />
                            New Collection 2025
                        </span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Exquisite
                            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent"> Sarees </span>
                            for Every Occasion
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                            Discover our handpicked collection of premium sarees, from traditional silk to contemporary designs. 
                            Crafted with love, delivered with care.
                        </p>
                    </div>
                    
                    <div className="flex justify-center items-center mb-12">
                        <Link href="/shop" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Shop Now
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">10K+</div>
                            <div className="text-gray-600">Happy Customers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">500+</div>
                            <div className="text-gray-600">Saree Designs</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-gray-900">15+</div>
                            <div className="text-gray-600">Years Experience</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Shop by Category
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Explore our curated collection of sarees for every style and occasion
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-100 to-rose-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Silk Sarees</h3>
                                <p className="text-gray-600 mb-6">
                                    Luxurious Kanchipuram, Banarasi, and Mysore silk sarees for special occasions
                                </p>
                                <Link href="/shop?category=silk" className="inline-flex items-center text-pink-600 font-semibold hover:text-pink-700">
                                    Explore Collection
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Cotton Sarees</h3>
                                <p className="text-gray-600 mb-6">
                                    Comfortable and breathable cotton sarees perfect for daily wear
                                </p>
                                <Link href="/shop?category=cotton" className="inline-flex items-center text-purple-600 font-semibold hover:text-purple-700">
                                    Explore Collection
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>

                        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Designer Sarees</h3>
                                <p className="text-gray-600 mb-6">
                                    Contemporary designs meeting traditional elegance
                                </p>
                                <Link href="/shop?category=designer" className="inline-flex items-center text-indigo-600 font-semibold hover:text-indigo-700">
                                    Explore Collection
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Featured Collection
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Handpicked sarees that showcase the finest craftsmanship and timeless beauty
                        </p>
                    </div>
                    
                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(8)].map((_, index) => (
                                <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                                    <div className="h-80 bg-gray-200"></div>
                                    <div className="p-6">
                                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProducts.map((product, index) => (
                                <div
                                    key={product._id}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                                >
                                    <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                                        <div className="relative overflow-hidden">
                                            <img 
                                                src={product.media?.[0]?.secure_url || product.featuredImage?.secure_url || '/api/placeholder/300/400'} 
                                                alt={product.name || product.title}
                                                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
                                                onError={(e) => {
                                                    e.target.src = '/api/placeholder/300/400'
                                                }}
                                            />
                                            <div className="absolute top-4 right-4">
                                                <WishlistButton product={product} />
                                            </div>
                                            {!product?.isAvailable && (
                                                <div className="absolute top-4 left-4">
                                                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                        Sold Out
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="p-6">
                                        <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-pink-600 transition-colors">
                                                {product.name || product.title}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                {product.mrp && product.sellingPrice && product.mrp > product.sellingPrice && (
                                                    <span className="text-sm text-gray-400 line-through">
                                                        ₹{product.mrp.toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                                <span className="text-2xl font-bold text-pink-600">
                                                    ₹{(product.sellingPrice || product.price || 0).toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-sm text-gray-600 ml-1">4.8</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <div className="text-center mt-12">
                        <Link href="/shop" className="inline-flex items-center px-8 py-4 bg-gray-900 text-white font-semibold rounded-full hover:bg-gray-800 transition-colors">
                            View All Products
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            What Our Customers Say
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Join thousands of satisfied customers who trust Narumugai for their saree needs
                        </p>
                    </div>
                    
                    <div className="relative max-w-4xl mx-auto">
                        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-3xl p-8 md:p-12">
                            <div className="text-center">
                                <div className="flex justify-center mb-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-8 h-8 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-2xl text-gray-800 mb-8 italic leading-relaxed">
                                    "{testimonials[currentTestimonial].text}"
                                </p>
                                <div className="flex items-center justify-center">
                                    <div className="w-16 h-16 bg-pink-200 rounded-full mr-4"></div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</h4>
                                        <p className="text-gray-600">{testimonials[currentTestimonial].location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-center mt-8 space-x-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentTestimonial(index)}
                                    className={`w-3 h-3 rounded-full transition-colors ${
                                        currentTestimonial === index ? 'bg-pink-600' : 'bg-gray-300'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            {/* Why Choose Us Section */}
            <section className="py-20 bg-gray-900 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Why Choose Narumugai?
                        </h2>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Experience the perfect blend of tradition and innovation
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Truck className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Free Shipping</h3>
                            <p className="text-gray-400">
                                Free delivery across India on orders above ₹999
                            </p>
                        </div>
                        
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Shield className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Quality Assured</h3>
                            <p className="text-gray-400">
                                100% authentic sarees with quality guarantee
                            </p>
                        </div>
                        
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Headphones className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">24/7 Support</h3>
                            <p className="text-gray-400">
                                Expert assistance for all your saree needs
                            </p>
                        </div>
                        
                        <div className="text-center group">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                <Award className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">15+ Years</h3>
                            <p className="text-gray-400">
                                Trusted experience in saree craftsmanship
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Instagram Section */}
            <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Follow Our Journey
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                            Stay connected with us on social media for the latest collections and styling tips
                        </p>
                        <div className="flex justify-center space-x-6">
                            <a href="#" className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300">
                                <FaInstagram className="w-6 h-6" />
                            </a>
                            <a href="#" className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300">
                                <FaWhatsapp className="w-6 h-6" />
                            </a>
                            <a href="#" className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300">
                                <FaFacebook className="w-6 h-6" />
                            </a>
                        </div>
                    </div>
                    

                </div>
            </section>


        </>
    )
}

export default Home