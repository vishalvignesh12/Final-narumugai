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
        unoptimized: true,  // Temporary fix for Cloudinary issues
        dangerouslyAllowSVG: true,
        contentDispositionType: 'attachment',
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;"
    },
    experimental: {
        optimizePackageImports: ['lucide-react'],
    }
};

export default nextConfig;
