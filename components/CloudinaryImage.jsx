'use client'
import Image from 'next/image'
import { useState } from 'react'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'

const CloudinaryImage = ({ 
    src, 
    alt, 
    width, 
    height, 
    className = '', 
    priority = false,
    fallbackSrc,
    ...props 
}) => {
    const [imgSrc, setImgSrc] = useState(src)
    const [hasError, setHasError] = useState(false)

    const handleError = () => {
        if (!hasError) {
            setHasError(true)
            setImgSrc(fallbackSrc || imgPlaceholder.src)
        }
    }

    const handleLoad = () => {
        setHasError(false)
    }

    // If the source is already a fallback or placeholder, don't use Next.js optimization
    const isCloudinaryUrl = imgSrc?.includes('res.cloudinary.com')
    const shouldOptimize = isCloudinaryUrl && !hasError

    if (!shouldOptimize) {
        return (
            <img
                src={imgSrc}
                alt={alt}
                width={width}
                height={height}
                className={className}
                onError={handleError}
                onLoad={handleLoad}
                {...props}
            />
        )
    }

    return (
        <Image
            src={imgSrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            priority={priority}
            onError={handleError}
            onLoad={handleLoad}
            {...props}
        />
    )
}

export default CloudinaryImage