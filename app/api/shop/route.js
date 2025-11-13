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
            size = 10,
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

        // Category filter
        if (categoryFilter.length > 0) {
            matchQuery['category.slug'] = { $in: categoryFilter };
        }

        // Price filter
        if (priceFilter.length === 2) {
            matchQuery.sellingPrice = { $gte: priceFilter[0], $lte: priceFilter[1] };
        }


        // Sorting
        const sortQuery = sorting.length > 0
            ? sorting.reduce((acc, sort) => {
                acc[sort.id] = sort.desc ? -1 : 1;
                return acc;
            }, {})
            : { createdAt: -1 };


        // Base aggregation pipeline
        const pipeline = [
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            { $match: matchQuery },
        ];


        // Check if color or size filters are applied
        const hasVariantFilters = colorFilter.length > 0 || sizeFilter.length > 0;

        if (hasVariantFilters) {
            const variantMatchQuery = {
                'variants.deletedAt': null
            };
            if (colorFilter.length > 0) {
                variantMatchQuery['variants.color'] = { $in: colorFilter };
            }
            if (sizeFilter.length > 0) {
                variantMatchQuery['variants.size'] = { $in: sizeFilter };
            }

            pipeline.push(
                {
                    $lookup: {
                        from: "productvariants",
                        localField: "_id",
                        foreignField: "product",
                        as: "variants"
                    }
                },
                {
                    $match: {
                        ...variantMatchQuery,
                        'variants': { $ne: [] } // Ensure product has variants matching the filter
                    }
                }
            );
        }

        // Add sorting, skipping, and limiting
        pipeline.push(
            { $sort: sortQuery },
            { $skip: start },
            { $limit: size },
            {
                $lookup: {
                    from: "media",
                    localField: "media",
                    foreignField: "_id",
                    as: "media"
                }
            }
        );


        // Execute pipeline
        const products = await ProductModel.aggregate(pipeline);

        // Get total count for pagination
        // We need a separate pipeline for count that stops before $skip and $limit
        const countPipeline = [
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            { $match: matchQuery }
        ];

        if (hasVariantFilters) {
            const variantMatchQuery = {
                'variants.deletedAt': null
            };
            if (colorFilter.length > 0) {
                variantMatchQuery['variants.color'] = { $in: colorFilter };
            }
            if (sizeFilter.length > 0) {
                variantMatchQuery['variants.size'] = { $in: sizeFilter };
            }
            countPipeline.push(
                {
                    $lookup: {
                        from: "productvariants",
                        localField: "_id",
                        foreignField: "product",
                        as: "variants"
                    }
                },
                { $match: { ...variantMatchQuery, 'variants': { $ne: [] } } }
            );
        }

        countPipeline.push({ $count: 'totalCount' });
        const countResult = await ProductModel.aggregate(countPipeline);
        const totalRowCount = countResult[0]?.totalCount || 0;


        return NextResponse.json({
            success: true,
            products: products,
            meta: { totalRowCount }
        });

    } catch (error) {
        return catchError(error)
    }
}

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
                { _id: { $in: productIdsFromVariants } } // Add matching product ids
            ]
        };

        const products = await ProductModel.find(matchQuery)
            .populate('category', 'name slug')
            .populate('media', 'secure_url')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        return response(true, 200, 'Search results', products);

    } catch (error) {
        return catchError(error)
    }
}