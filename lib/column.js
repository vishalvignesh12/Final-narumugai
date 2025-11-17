'use client' // --- THIS IS THE FIX ---

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Chip } from "@mui/material"
import dayjs from "dayjs"
import userIcon from '@/public/assets/images/user.png'

/* ===========================
    CATEGORY COLUMNS
=========================== */
export const DT_CATEGORY_COLUMN = [
    {
        accessorKey: 'name',
        header: 'Category Name',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
]

/* ===========================
    PRODUCT COLUMNS
=========================== */
export const DT_PRODUCT_COLUMN = [
    {
        accessorKey: 'name',
        header: 'Product Name',
    },
    {
        accessorKey: 'slug',
        header: 'Slug',
    },
    {
        accessorKey: 'category',
        header: 'Category',
    },
    {
        accessorKey: 'mrp',
        header: 'MRP',
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount Percentage',
    },
]

/* ===========================
    PRODUCT VARIANT COLUMNS
=========================== */
export const DT_PRODUCT_VARIANT_COLUMN = [
    {
        accessorKey: 'product',
        header: 'Product Name',
    },
    {
        accessorKey: 'color',
        header: 'Color',
    },
    {
        accessorKey: 'size',
        header: 'Size',
    },
    {
        accessorKey: 'sku',
        header: 'SKU',
    },
    {
        accessorKey: 'mrp',
        header: 'MRP',
    },
    {
        accessorKey: 'sellingPrice',
        header: 'Selling Price',
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount Percentage',
    },
]

/* ===========================
    COUPON COLUMNS
=========================== */
export const DT_COUPON_COLUMN = [
    {
        accessorKey: 'code',
        header: 'Code',
    },
    {
        accessorKey: 'discountPercentage',
        header: 'Discount Percentage',
    },
    {
        accessorKey: 'minShoppingAmount',
        header: 'Min. Shopping Amount',
    },
    {
        accessorKey: 'validity',
        header: 'Validity',
        Cell: ({ renderedCellValue }) => (
            new Date() > new Date(renderedCellValue)
                ? <Chip color="error" label={dayjs(renderedCellValue).format('DD/MM/YYYY')} />
                : <Chip color="success" label={dayjs(renderedCellValue).format('DD/MM/YYYY')} />
        )
    },
]

/* ===========================
    CUSTOMERS COLUMNS
=========================== */
export const DT_CUSTOMERS_COLUMN = [
    {
        accessorKey: 'avatar',
        header: 'Avatar',
        Cell: ({ renderedCellValue }) => (
            <Avatar>
                <AvatarImage src={renderedCellValue?.url || userIcon.src} />
            </Avatar>
        )
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'phone',
        header: 'Phone',
    },
    {
        accessorKey: 'address',
        header: 'Address',
    },
    {
        accessorKey: 'isEmailVerified',
        header: 'Is Verified',
        Cell: ({ renderedCellValue }) =>
            renderedCellValue
                ? <Chip color="success" label="Verified" />
                : <Chip color="error" label="Not Verified" />
    },
]

/* ===========================
    REVIEWS COLUMNS
=========================== */
export const DT_REVIEW_COLUMN = [
    {
        accessorKey: 'product',
        header: 'Product',
    },
    {
        accessorKey: 'user',
        header: 'User',
    },
    {
        accessorKey: 'title',
        header: 'Title',
    },
    {
        accessorKey: 'rating',
        header: 'Rating',
    },
    {
        accessorKey: 'review',
        header: 'Review',
    },
]

/* ===========================
    ORDERS COLUMNS
=========================== */
export const DT_ORDER_COLUMN = [
    {
        accessorKey: 'order_id',
        header: 'Order Id',
    },
    {
        accessorKey: 'payment_id',
        header: 'Payment Id',
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'phone',
        header: 'Phone',
    },
    {
        accessorKey: 'country',
        header: 'Country',
    },
    {
        accessorKey: 'state',
        header: 'State',
    },
    {
        accessorKey: 'city',
        header: 'City',
    },
    {
        accessorKey: 'pincode',
        header: 'Pincode',
    },
    {
        accessorKey: 'totalItem',
        header: 'Total Item',
        Cell: ({ row }) => (
            <span>{row?.original?.products?.reduce((t, p) => t + (p.qty || 1), 0) || 0}</span>
        )
    },
    {
        accessorKey: 'subtotal',
        header: 'Subtotal',
    },
    {
        accessorKey: 'discount',
        header: 'Discount',
        Cell: ({ renderedCellValue }) => (
            <span>{Math.round(renderedCellValue)}</span>
        )
    },
    {
        accessorKey: 'couponDiscount',
        header: 'Coupon Discount',
    },
    {
        accessorKey: 'totalAmount',
        header: 'Total Amount',
    },
    {
        accessorKey: 'status',
        header: 'Status',
    },
]

/* ===========================
    🔥 SLIDER + BANNER COLUMNS (MISSING BEFORE)
=========================== */
export const DT_SLIDER_COLUMN = [
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'image', header: 'Image' },
    { accessorKey: 'link', header: 'Link' },
    { accessorKey: 'status', header: 'Status' },
]

export const DT_BANNER_COLUMN = [
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'image', header: 'Image' },
    { accessorKey: 'link', header: 'Link' },
    { accessorKey: 'status', header: 'Status' },
]

/* ==========================================================
    🔒 SAFETY NET (Build will NEVER crash again)
    Prevents "x.length" or "undefined.map" errors
    during prerender even if someone forgets to export.
========================================================== */
export const SAFE_COLUMNS = {
    DT_CATEGORY_COLUMN: Array.isArray(DT_CATEGORY_COLUMN) ? DT_CATEGORY_COLUMN : [],
    DT_PRODUCT_COLUMN: Array.isArray(DT_PRODUCT_COLUMN) ? DT_PRODUCT_COLUMN : [],
    DT_PRODUCT_VARIANT_COLUMN: Array.isArray(DT_PRODUCT_VARIANT_COLUMN) ? DT_PRODUCT_VARIANT_COLUMN : [],
    DT_COUPON_COLUMN: Array.isArray(DT_COUPON_COLUMN) ? DT_COUPON_COLUMN : [],
    DT_CUSTOMERS_COLUMN: Array.isArray(DT_CUSTOMERS_COLUMN) ? DT_CUSTOMERS_COLUMN : [],
    DT_REVIEW_COLUMN: Array.isArray(DT_REVIEW_COLUMN) ? DT_REVIEW_COLUMN : [],
    DT_ORDER_COLUMN: Array.isArray(DT_ORDER_COLUMN) ? DT_ORDER_COLUMN : [],
    DT_SLIDER_COLUMN: Array.isArray(DT_SLIDER_COLUMN) ? DT_SLIDER_COLUMN : [],
    DT_BANNER_COLUMN: Array.isArray(DT_BANNER_COLUMN) ? DT_BANNER_COLUMN : [],
}

// EXPORT SAFE VERSIONS AUTOMATICALLY
export const SAFE_DT_CATEGORY_COLUMN = SAFE_COLUMNS.DT_CATEGORY_COLUMN
export const SAFE_DT_PRODUCT_COLUMN = SAFE_COLUMNS.DT_PRODUCT_COLUMN
export const SAFE_DT_PRODUCT_VARIANT_COLUMN = SAFE_COLUMNS.DT_PRODUCT_VARIANT_COLUMN
export const SAFE_DT_COUPON_COLUMN = SAFE_COLUMNS.DT_COUPON_COLUMN
export const SAFE_DT_CUSTOMERS_COLUMN = SAFE_COLUMNS.DT_CUSTOMERS_COLUMN
export const SAFE_DT_REVIEW_COLUMN = SAFE_COLUMNS.DT_REVIEW_COLUMN
export const SAFE_DT_ORDER_COLUMN = SAFE_COLUMNS.DT_ORDER_COLUMN
export const SAFE_DT_SLIDER_COLUMN = SAFE_COLUMNS.DT_SLIDER_COLUMN
export const SAFE_DT_BANNER_COLUMN = SAFE_COLUMNS.DT_BANNER_COLUMN