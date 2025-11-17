import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { NextResponse } from "next/server";

// Cache this route for 60 seconds
export const revalidate = 60;

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const {
            start = 0,
            size = 12, // Default size from your page.jsx
            filters = [],
            sorting = [],
            globalFilter = "",
            categoryFilter = [],
            colorFilter = [],
            sizeFilter = [],
            priceFilter = [],
            slug
        } = payload;


        const matchQuery = { deletedAt: null, isAvailable: true };

        // Handle slug
        if (slug) {
            matchQuery.slug = slug
        }

        // Global search
        if (globalFilter) {
            matchQuery["$or"] = [
                { name: { $regex: globalFilter, $options: 'i' } },
                { description: { $regex: globalFilter, $options: 'i' } },
            ];
        }

        // Column filters
        filters.forEach(filter => {
            matchQuery[filter.id] = { $regex: filter.value, $options: 'i' };
        });

        // Sorting
        let sortQuery = {};
        sorting.forEach(sort => {
            sortQuery[sort.id] = sort.desc ? -1 : 1;
        });

        // Price filter
        if (priceFilter && priceFilter.length === 2) {
            matchQuery.sellingPrice = { $gte: priceFilter[0], $lte: priceFilter[1] };
        }

        // Category filter
        if (categoryFilter && categoryFilter.length > 0) {
            matchQuery.category = { $in: categoryFilter }; 
        }

        // --- (Add Color/Size filters if needed) ---
        
        // Use find with populate for simpler and more reliable media handling
        const products = await ProductModel.find(matchQuery)
            .populate({
                path: 'category',
                select: 'name slug'
            })
            .populate({
                path: 'media',
                select: 'secure_url alt title'
            })
            .sort(sortQuery)
            .skip(start)
            .limit(size)
            .select('name slug mrp sellingPrice isAvailable category media');
        const totalRowCount = await ProductModel.countDocuments(matchQuery);

        // Return the products and the total count
        return NextResponse.json({ success: true, products: products, meta: { totalRowCount } })

    } catch (error) {
        return catchError(error)
    }
}


// Search functionality (GET request)
export async function GET(request) {
    try {
        await connectDB()
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q')

        if (!query) {
            return response(false, 400, 'Search query is required.')
        }

        // Find product ids that match variants
        const matchingVariants = await ProductVariantModel.find({
            $or: [
                { color: { $regex: query, $options: 'i' } },
                { size: { $regex: query, $options: 'i' } },
                { sku: { $regex: query, $options: 'i' } },
            ],
            deletedAt: null
        }).select('product');

        const productIdsFromVariants = matchingVariants.map(v => v.product);

        // Main search query
        const matchQuery = {
            deletedAt: null,
            isAvailable: true,
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { _id: { $in: productIdsFromVariants } } 
            ]
        };

        // --- FIX FOR GET REQUEST ---
        // Use the correct populate syntax for media
        const products = await ProductModel.find(matchQuery)
            .populate('category', 'name slug')
            .populate({ path: 'media', select: 'secure_url alt title' }) // Correct populate
            .sort({ createdAt: -1 })
            .limit(10)
            .select('name slug sellingPrice mrp media category'); 

        return response(true, 200, 'Search results', products)

    } catch (error) {
        return catchError(error)
    }
}