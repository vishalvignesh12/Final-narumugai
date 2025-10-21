/** @type {import('next').NextConfig} */
const nextConfig = {
    // Image optimization
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            }
        ],
        unoptimized: true,
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
        formats: ['image/webp', 'image/avif'],
    },

    // Production optimizations
    reactStrictMode: true,
    poweredByHeader: false, // Remove X-Powered-By header for security

    // Compression
    compress: true,

    // Logging
    logging: {
        fetches: {
            fullUrl: true,
        },
    },

    // Production-only optimizations
    ...(process.env.NODE_ENV === 'production' && {
        compiler: {
            removeConsole: {
                exclude: ['error', 'warn'], // Keep error and warn logs
            },
        },
    }),

    // Environment variables validation
    env: {
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
        NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    },

    // Experimental features for better performance
    experimental: {
        optimizePackageImports: ['@mui/material', '@mui/icons-material', 'lucide-react'],
    },
};

export default nextConfig;
