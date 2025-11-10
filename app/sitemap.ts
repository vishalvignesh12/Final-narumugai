import { MetadataRoute } from 'next';
import { connectDB } from '@/lib/databaseConnection';
import ProductModel from '@/models/Product.model';
import CategoryModel from '@/models/Category.model';

// Use the variable from your .env file
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    try {
        await connectDB();

        // 1. Get all products
        const products = await ProductModel.find({ deletedAt: null, isAvailable: true }).select('slug updatedAt').lean();
        const productUrls = products.map(product => ({
            url: `${BASE_URL}/product/${product.slug}`,
            lastModified: product.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.9,
        }));

        // 2. Get all categories
        // NOTE: This assumes your category URL is /shop?category=...
        // If you have a dedicated page like /category/[slug], change the URL
        const categories = await CategoryModel.find({ deletedAt: null }).select('slug updatedAt').lean();
        const categoryUrls = categories.map(category => ({
            url: `${BASE_URL}/shop?category=${category.slug}`, // Based on your current app structure
            lastModified: category.updatedAt || new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        // 3. Define static routes
        const staticRoutes = [
            '/', '/shop', '/about-us', '/privacy-policy', 
            '/refund-policy', '/return-policy', '/shipping-policy', 
            '/terms-and-conditions'
        ].map(route => ({
            url: `${BASE_URL}${route}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: route === '/' ? 1.0 : (route === '/shop' ? 0.8 : 0.5),
        }));

        // 4. Combine all routes
        return [
            ...staticRoutes,
            ...productUrls,
            ...categoryUrls
        ];

    } catch (error) {
        console.error("Failed to generate sitemap:", error);
        // Return a minimal sitemap on error
        return [
            {
                url: BASE_URL,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
            }
        ];
    }
}