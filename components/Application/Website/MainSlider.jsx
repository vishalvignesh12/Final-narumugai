'use client'
import React, { useEffect, useState } from 'react'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Image from 'next/image';
import { LuChevronRight } from "react-icons/lu";
import { LuChevronLeft } from "react-icons/lu";
import axios from 'axios';

const ArrowNext = (props) => {
    const { onClick } = props
    return (
        <button onClick={onClick} type='button' className='w-14 h-14 flex justify-center items-center rounded-full absolute z-10 top-1/2 -translate-y-1/2 bg-white right-10' >
            <LuChevronRight size={25} className='text-gray-600' />
        </button>
    )
}
const ArrowPrev = (props) => {
    const { onClick } = props
    return (
        <button onClick={onClick} type='button' className='w-14 h-14 flex justify-center items-center rounded-full absolute z-10 top-1/2 -translate-y-1/2 bg-white left-10' >
            <LuChevronLeft size={25} className='text-gray-600' />
        </button>
    )
}

const MainSlider = () => {
    const [sliders, setSliders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSliders = async () => {
            try {
                const response = await axios.get('/api/sliders/get?isActive=true')
                if (response.data.success) {
                    setSliders(response.data.data)
                }
            } catch (error) {
                console.error('Failed to fetch sliders:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSliders()
    }, [])

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        autoplay: true,
        nextArrow: <ArrowNext />,
        prevArrow: <ArrowPrev />,

        responsive: [
            {
                breakpoint: 480,
                settings: {
                    dots: false,
                    arrow: false,
                    nextArrow: '',
                    prevArrow: ''
                }
            }
        ]
    }

    if (loading) {
        return (
            <div className="h-64 flex items-center justify-center">
                <p>Loading sliders...</p>
            </div>
        )
    }

    // Fallback to static images if no sliders are available
    if (sliders.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center">
                <p>No sliders available</p>
            </div>
        )
    }

    return (
        <div>
            <Slider {...settings}>
                {sliders.map((slider) => (
                    <div key={slider._id}>
                        {slider.link ? (
                            <a href={slider.link} target="_blank" rel="noopener noreferrer">
                                <img 
                                    src={slider.mediaId?.secure_url} 
                                    alt={slider.mediaId?.alt || slider.title || 'Slider image'}
                                    className="w-full h-auto"
                                />
                            </a>
                        ) : (
                            <img 
                                src={slider.mediaId?.secure_url} 
                                alt={slider.mediaId?.alt || slider.title || 'Slider image'}
                                className="w-full h-auto"
                            />
                        )}
                    </div>
                ))}
            </Slider>
        </div>
    )
}

export default MainSlider