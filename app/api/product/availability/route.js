import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError } from "@/lib/helperFunction"
import ProductModel from "@/models/Product.model"
import { NextResponse } from "next/server"

// GET all products with availability status for admin
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 403 })
        }

        await connectDB()

        const searchParams = request.nextUrl.searchParams
        const page = parseInt(searchParams.get('page') || 0, 10)
        const limit = parseInt(searchParams.get('limit') || 20, 10)
        const search = searchParams.get('search') || ""

        // Build match query
        let matchQuery = { deletedAt: null }

        // Global search
        if (search) {
            matchQuery["$or"] = [
                { name: { $regex: search, $options: 'i' } },
                { slug: { $regex: search, $options: 'i' } },
                { "categoryData.name": { $regex: search, $options: 'i' } }
            ]
        }

        // Aggregate pipeline
        const aggregatePipeline = [
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryData'
                }
            },
            {
                $unwind: {
                    path: "$categoryData",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'medias', // FIX: Changed from 'media' to 'medias' to match Model definition
                    localField: 'media',
                    foreignField: '_id',
                    as: 'mediaData'
                }
            },
            { $match: matchQuery },
            { $sort: { createdAt: -1 } },
            { $skip: page * limit },
            { $limit: limit },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                    mrp: 1,
                    sellingPrice: 1,
                    discountPercentage: 1,
                    isAvailable: 1,
                    soldAt: 1,
                    category: "$categoryData.name",
                    media: {
                        $map: {
                            input: "$mediaData",
                            as: "media",
                            in: {
                                _id: "$$media._id",
                                secure_url: "$$media.secure_url",
                                alt: "$$media.alt"
                            }
                        }
                    },
                    createdAt: 1,
                    updatedAt: 1
                }
            }
        ]

        // Execute query
        const products = await ProductModel.aggregate(aggregatePipeline)

        // Get total count for pagination
        const totalCountPipeline = [
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'categoryData'
                }
            },
            {
                $unwind: {
                    path: "$categoryData",
                    preserveNullAndEmptyArrays: true
                }
            },
            { $match: matchQuery },
            { $count: "total" }
        ]

        const totalResult = await ProductModel.aggregate(totalCountPipeline)
        const totalProducts = totalResult.length > 0 ? totalResult[0].total : 0

        return NextResponse.json({
            success: true,
            data: products,
            meta: {
                totalProducts,
                currentPage: page,
                totalPages: Math.ceil(totalProducts / limit),
                hasNextPage: (page + 1) * limit < totalProducts,
                hasPrevPage: page > 0
            }
        })

    } catch (error) {
        return catchError(error)
    }
}

// PATCH update product availability status
export async function PATCH(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 403 })
        }

        await connectDB()

        const { productId, isAvailable } = await request.json()

        if (!productId) {
            return NextResponse.json({
                success: false,
                message: 'Product ID is required.'
            }, { status: 400 })
        }

        // Find the product
        const product = await ProductModel.findById(productId)
        if (!product) {
            return NextResponse.json({
                success: false,
                message: 'Product not found.'
            }, { status: 404 })
        }

        // Update availability
        const updateData = {
            isAvailable: isAvailable
        }

        // If marking as sold out, record the sold date
        if (!isAvailable) {
            updateData.soldAt = new Date()
        } else {
            // If marking as available, clear the sold date
            updateData.soldAt = null
        }

        const updatedProduct = await ProductModel.findByIdAndUpdate(
            productId,
            updateData,
            { new: true }
        )

        const statusMessage = isAvailable ? 'marked as available' : 'marked as sold out'

        return NextResponse.json({
            success: true,
            message: `Product "${product.name}" has been ${statusMessage}.`,
            data: updatedProduct
        })

    } catch (error) {
        return catchError(error)
    }
}