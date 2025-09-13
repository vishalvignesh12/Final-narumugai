'use client'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const DynamicBanners = ({ position = 'homepage-top', maxBanners = 2 }) => {
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/api/banners/get/position?position=${position}`)
                setBanners(data.data?.slice(0, maxBanners) || [])
            } catch (error) {
                console.log('Error fetching banners:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchBanners()
    }, [position, maxBanners])

    if (loading) {
        return (
            <section className='lg:px-32 px-4 sm:pt-20 pt-5 pb-10'>
                <div className={`grid ${maxBanners === 2 ? 'grid-cols-2' : 'grid-cols-1'} sm:gap-10 gap-2`}>
                    {[...Array(maxBanners)].map((_, index) => (
                        <div key={index} className='border rounded-lg overflow-hidden animate-pulse'>
                            <div className='w-full h-48 bg-gray-200'></div>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    if (!banners || banners.length === 0) {
        // Show blank space when no banners are available
        return null
    }

    return (
        <section className='lg:px-32 px-4 sm:pt-20 pt-5 pb-10'>
            <div className={`grid ${banners.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} sm:gap-10 gap-2`}>
                {banners.map((banner, index) => (
                    <div key={banner._id} className='border rounded-lg overflow-hidden'>
                        {banner.link ? (
                            <Link href={banner.link}>
                                <Image
                                    src={banner.mediaId?.secure_url}
                                    alt={banner.alt || banner.title || `Banner ${index + 1}`}
                                    title={banner.title || `Banner ${index + 1}`}
                                    width={600}
                                    height={300}
                                    className='transition-all hover:scale-110 w-full h-auto object-cover'
                                />
                            </Link>
                        ) : (
                            <Image
                                src={banner.mediaId?.secure_url}
                                alt={banner.alt || banner.title || `Banner ${index + 1}`}
                                title={banner.title || `Banner ${index + 1}`}
                                width={600}
                                height={300}
                                className='transition-all hover:scale-110 w-full h-auto object-cover'
                            />
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}

export default DynamicBanners