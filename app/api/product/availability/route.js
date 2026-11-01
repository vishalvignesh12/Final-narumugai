import { isAuthenticated } from "@/lib/authentication"
import { connectDB } from "@/lib/databaseConnection"
import { catchError } from "@/lib/helperFunction"
import ProductModel from "@/models/Product.model"
import ProductVariantModel from "@/models/ProductVariant.model"
import { NextResponse } from "next/server"
import mongoose from "mongoose"

const DEFAULT_PAGE_SIZE = 20
const MAX_PAGE_SIZE = 100
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// GET all products with availability status for admin
export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return NextResponse.json({ success: false, message: 'Unauthorized.' }, { status: 403 })
        }

        await connectDB()

        const searchParams = request.nextUrl.searchParams
        const pageValue = searchParams.get('page') ?? '0'
        const limitValue = searchParams.get('limit') ?? String(DEFAULT_PAGE_SIZE)
        const page = Number(pageValue)
        const requestedLimit = Number(limitValue)
        if (!Number.isSafeInteger(page) || page < 0 || !Number.isSafeInteger(requestedLimit) || requestedLimit < 1) {
            return NextResponse.json({ success: false, message: 'Page and limit must be positive integers.' }, { status: 400 })
        }
        const limit = Math.min(requestedLimit, MAX_PAGE_SIZE)
        const search = (searchParams.get('search') || '').trim().slice(0, 100)
        const searchRegex = new RegExp(escapeRegex(search), 'i')

        // Build match query
        let matchQuery = { deletedAt: null }

        // Global search
        if (search) {
            matchQuery["$or"] = [
                { name: searchRegex },
                { slug: searchRegex },
                { "categoryData.name": searchRegex }
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
                $lookup: {
                    from: 'productvariants',
                    let: { productId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$product', '$$productId'] },
                                        { $eq: ['$deletedAt', null] }
                                    ]
                                }
                            }
                        },
                        { $project: { _id: 1, size: 1, color: 1, quantity: 1, soldAt: 1 } },
                        { $sort: { size: 1, color: 1 } }
                    ],
                    as: 'variants'
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                    mrp: 1,
                    sellingPrice: 1,
                    discountPercentage: 1,
                    isAvailable: {
                        $cond: [
                            { $gt: [{ $size: '$variants' }, 0] },
                            {
                                $gt: [
                                    {
                                        $size: {
                                            $filter: {
                                                input: '$variants',
                                                as: 'variant',
                                                cond: { $gt: ['$$variant.quantity', 0] }
                                                }
                                        }
                                    },
                                    0
                                ]
                            },
                            { $and: ['$isAvailable', { $gt: ['$quantity', 0] }] }
                        ]
                    },
                    soldAt: 1,
                    variants: 1,
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

        const { productId, variantId, isAvailable } = await request.json()

        if (typeof isAvailable !== 'boolean') {
            return NextResponse.json({ success: false, message: 'Availability must be true or false.' }, { status: 400 })
        }

        if (variantId && !mongoose.isValidObjectId(variantId)) {
            return NextResponse.json({ success: false, message: 'Product size ID is invalid.' }, { status: 400 })
        }

        if (variantId) {
            const variant = await ProductVariantModel.findOne({ _id: variantId, deletedAt: null })
            if (!variant) {
                return NextResponse.json({ success: false, message: 'Product size was not found.' }, { status: 404 })
            }
            const parentProduct = await ProductModel.findOne({ _id: variant.product, deletedAt: null }).select('_id')
            if (!parentProduct) {
                return NextResponse.json({ success: false, message: 'Product was not found.' }, { status: 404 })
            }

            variant.quantity = isAvailable ? 1 : 0
            variant.soldAt = isAvailable ? null : new Date()
            await variant.save()

            const availableVariants = await ProductVariantModel.countDocuments({
                product: variant.product,
                deletedAt: null,
                quantity: { $gt: 0 }
            })
            const product = await ProductModel.findOneAndUpdate(
                { _id: variant.product, deletedAt: null },
                {
                    $set: {
                        isAvailable: availableVariants > 0,
                        soldAt: availableVariants > 0 ? null : new Date()
                    }
                },
                { new: true }
            )
            if (!product) {
                return NextResponse.json({ success: false, message: 'Product was not found.' }, { status: 404 })
            }

            return NextResponse.json({
                success: true,
                message: `Size ${variant.size} has been ${isAvailable ? 'marked as available' : 'marked as sold out'}.`,
                data: { variant, product }
            })
        }

        if (!productId) {
            return NextResponse.json({
                success: false,
                message: 'Product ID is required.'
            }, { status: 400 })
        }
        if (!mongoose.isValidObjectId(productId)) {
            return NextResponse.json({ success: false, message: 'Product ID is invalid.' }, { status: 400 })
        }

        // Find the product
        const product = await ProductModel.findOne({ _id: productId, deletedAt: null })
        if (!product) {
            return NextResponse.json({
                success: false,
                message: 'Product not found.'
            }, { status: 404 })
        }

        // Update availability
        const updateData = {
            isAvailable,
            quantity: isAvailable ? 1 : 0
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
