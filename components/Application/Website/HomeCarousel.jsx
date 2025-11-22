"use client"
import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import axios from 'axios';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const HomeCarousel = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);

    const settings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        fade: true,
        cssEase: 'linear',
        arrows: false,
    };

    const fallbackSlides = [
        {
            _id: 'fallback-1',
            title: "Exquisite Silk Sarees",
            subtitle: "Handwoven perfection for your special moments",
            cta: "Shop Silk",
            link: "/shop?category=silk",
            bgClass: "from-pink-100 via-rose-100 to-red-100",
            textClass: "text-rose-900",
            buttonClass: "bg-rose-600 hover:bg-rose-700",
            isFallback: true
        },
        {
            _id: 'fallback-2',
            title: "Comfortable Cotton Drapes",
            subtitle: "Breathable elegance for everyday grace",
            cta: "Shop Cotton",
            link: "/shop?category=cotton",
            bgClass: "from-blue-100 via-indigo-100 to-violet-100",
            textClass: "text-indigo-900",
            buttonClass: "bg-indigo-600 hover:bg-indigo-700",
            isFallback: true
        },
        {
            _id: 'fallback-3',
            title: "Contemporary Designer Wear",
            subtitle: "Modern designs meeting traditional roots",
            cta: "Shop Designer",
            link: "/shop?category=designer",
            bgClass: "from-amber-100 via-orange-100 to-yellow-100",
            textClass: "text-amber-900",
            buttonClass: "bg-amber-600 hover:bg-amber-700",
            isFallback: true
        }
    ];

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const { data } = await axios.get('/api/banners/get?position=homepage-top&isActive=true');
                if (data.success && data.data.banners.length > 0) {
                    setBanners(data.data.banners);
                }
            } catch (error) {
                console.error("Failed to fetch banners:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBanners();
    }, []);

    const slidesToDisplay = banners.length > 0 ? banners : fallbackSlides;

    return (
        <div className="relative overflow-hidden w-full h-[600px] md:h-[700px]">
            <Slider {...settings} className="h-full">
                {slidesToDisplay.map((slide) => (
                    <div key={slide._id} className="outline-none h-full">
                        {slide.isFallback ? (
                            // Fallback Slide Design (Abstract Background)
                            <div className={`relative h-[600px] md:h-[700px] w-full flex items-center justify-center bg-gradient-to-br ${slide.bgClass}`}>
                                <div className="absolute inset-0 overflow-hidden opacity-20">
                                    <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl"></div>
                                    <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-white blur-3xl"></div>
                                    <div className="absolute -bottom-12 left-1/3 w-80 h-80 rounded-full bg-white blur-3xl"></div>
                                </div>

                                <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
                                    <h2 className={`text-5xl md:text-7xl font-bold mb-6 tracking-tight ${slide.textClass} animate-in fade-in slide-in-from-bottom-8 duration-1000`}>
                                        {slide.title}
                                    </h2>
                                    <p className={`text-xl md:text-2xl mb-10 opacity-90 ${slide.textClass} animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200`}>
                                        {slide.subtitle}
                                    </p>
                                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                                        <Link
                                            href={slide.link}
                                            className={`inline-flex items-center px-8 py-4 text-white font-semibold rounded-full shadow-lg transition-transform transform hover:scale-105 ${slide.buttonClass}`}
                                        >
                                            {slide.cta}
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Dynamic Banner Slide (Image Background)
                            <div className="relative h-[600px] md:h-[700px] w-full">
                                <div
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                    style={{ backgroundImage: `url(${slide.mediaId?.secure_url || '/api/placeholder/1920/800'})` }}
                                >
                                    {/* Overlay for better text readability */}
                                    <div className="absolute inset-0 bg-black/30"></div>
                                </div>

                                <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
                                    <div className="max-w-4xl mx-auto">
                                        {slide.title && (
                                            <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                                {slide.title}
                                            </h2>
                                        )}
                                        {slide.link && (
                                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                                                <Link
                                                    href={slide.link}
                                                    className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl"
                                                >
                                                    Shop Now
                                                    <ArrowRight className="w-5 h-5 ml-2" />
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </Slider>

            <style jsx global>{`
                .slick-dots {
                    bottom: 30px;
                }
                .slick-dots li button:before {
                    font-size: 12px;
                    color: rgba(255,255,255,0.5);
                    opacity: 1;
                }
                .slick-dots li.slick-active button:before {
                    color: rgba(255,255,255,1);
                }
            `}</style>
        </div>
    );
};

export default HomeCarousel;
