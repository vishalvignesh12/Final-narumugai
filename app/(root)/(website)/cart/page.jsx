'use client'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { WEBSITE_CHECKOUT, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import { IoCloseCircleOutline } from "react-icons/io5";

// --- *** FIX: Import the correct actions from the reducer *** ---
import { removeProduct, updateProductQty } from '@/store/reducer/cartReducer'
// --- *** END OF FIX *** ---

import { Input } from '@/components/ui/input'
import { Plus, Minus } from 'lucide-react'
import { showToast } from '@/lib/showToast'

const breadCrumb = {
    title: 'Your Cart',
    links: [
        { label: "Cart" }
    ]
}

const CartPage = () => {
    const dispatch = useDispatch()
    const cart = useSelector(store => store.cartStore)
    const [subtotal, setSubtotal] = useState(0)

    useEffect(() => {
        const total = cart.products.reduce((sum, product) => {
            return sum + (product.sellingPrice * (product.qty || 1));
        }, 0);
        setSubtotal(total);
    }, [cart.products])

    // --- *** FIX: Implement handler functions using correct actions *** ---
    const handleRemove = (variantId) => {
        if (confirm("Are you sure you want to remove this item?")) {
            dispatch(removeProduct(variantId));
            showToast('success', 'Item removed from cart');
        }
    }

    const handleQuantityChange = (variantId, newQty) => {
        if (newQty < 1) {
            handleRemove(variantId); // Remove if quantity goes below 1
        } else if (newQty > 10) {
            showToast('error', 'You can only purchase a maximum of 10 items');
        } else {
            dispatch(updateProductQty({ variantId, qty: newQty }));
        }
    }
    // --- *** END OF FIX *** ---

    return (
        <div>
            <WebsiteBreadcrumb props={breadCrumb} />
            <div className='lg:px-32 px-4 my-20'>
                {cart.count === 0 ? (
                    <div className='w-full h-[50vh] flex flex-col justify-center items-center'>
                        <h4 className='text-4xl font-semibold mb-5'>Your cart is empty!</h4>
                        <Button type="button" asChild>
                            <Link href={WEBSITE_SHOP}>Continue Shopping</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Cart Items */}
                        <div className="lg:col-span-2">
                            <table className="w-full">
                                <thead className="border-b">
                                    <tr className="text-left">
                                        <th className="py-4 font-medium">Product</th>
                                        <th className="py-4 font-medium hidden md:table-cell">Price</th>
                                        <th className="py-4 font-medium">Quantity</th>
                                        <th className="py-4 font-medium text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.products.map(item => (
                                        <tr key={item.variantId} className="border-b">
                                            {/* Product Details */}
                                            <td className="py-5">
                                                <div className="flex items-start gap-4">
                                                    <Link href={item.url ? `/product/${item.url}` : '#'}>
                                                        <Image
                                                            src={item.media || imgPlaceholder}
                                                            width={100}
                                                            height={120}
                                                            alt={item.name}
                                                            className="w-24 h-auto rounded-lg object-cover"
                                                            unoptimized
                                                        />
                                                    </Link>
                                                    <div className="flex-1">
                                                        <Link href={item.url ? `/product/${item.url}` : '#'} className="font-medium text-sm hover:text-primary">
                                                            {item.name}
                                                        </Link>
                                                        <p className="text-xs text-gray-500">Color: {item.color}</p>
                                                        <p className="text-xs text-gray-500">Size: {item.size}</p>
                                                        <button 
                                                            onClick={() => handleRemove(item.variantId)} 
                                                            className="text-xs text-red-500 hover:underline mt-2 flex items-center gap-1"
                                                        >
                                                            <IoCloseCircleOutline /> Remove
                                                        </button>
                                                        <p className="font-medium text-sm mt-2 md:hidden">
                                                            {item.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Price */}
                                            <td className="py-5 font-medium text-sm hidden md:table-cell">
                                                {item.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </td>
                                            {/* Quantity */}
                                            <td className="py-5">
                                                <div className="flex items-center gap-1 border rounded-md p-1 w-fit">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => handleQuantityChange(item.variantId, (item.qty || 1) - 1)}
                                                    >
                                                        <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <Input
                                                        type="number"
                                                        value={item.qty || 1}
                                                        onChange={(e) => handleQuantityChange(item.variantId, parseInt(e.target.value) || 1)}
                                                        className="w-12 h-7 text-center border-none shadow-none p-0 focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        onClick={() => handleQuantityChange(item.variantId, (item.qty || 1) + 1)}
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                            {/* Total */}
                                            <td className="py-5 font-semibold text-sm text-right">
                                                {((item.sellingPrice) * (item.qty || 1)).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 p-6 rounded-lg sticky top-24">
                                <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>{subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="font-medium text-green-600">Free</span>
                                    </div>
                                    <div className="border-t pt-4">
                                        <div className="flex justify-between font-bold text-lg">
                                            <span>Total</span>
                                            <span>{subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                        </div>
                                    </div>
                                </div>
                                <Button asChild size="lg" className="w-full mt-6">
                                    <Link href={WEBSITE_CHECKOUT}>Proceed to Checkout</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CartPage