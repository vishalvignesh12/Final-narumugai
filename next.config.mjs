/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            }
        ],
        unoptimized: false,  // Enable optimization for production
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
    },
    experimental: {
        optimizePackageImports: ['lucide-react'],
    },
    // Optimize for Vercel deployment
    output: 'standalone',
    poweredByHeader: false,
    compress: true,
    // API routes optimization
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
        responseLimit: false,
    }
};

export default nextConfig;
