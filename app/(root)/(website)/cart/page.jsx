'use client'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { Button } from '@/components/ui/button'
import { WEBSITE_CHECKOUT, WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import { HiMinus, HiPlus } from "react-icons/hi2";
import { IoCloseCircleOutline } from "react-icons/io5";
import { decreaseQuantity, increaseQuantity, removeFromCart } from '@/store/reducer/cartReducer'

const breadCrumb = {
    title: 'Cart',
    links: [
        { label: "Cart" }
    ]
}
const CartPage = () => {
    const dispatch = useDispatch()
    const cart = useSelector(store => store.cartStore)

    const [subtotal, setSubTotal] = useState(0)
    const [discount, setDiscount] = useState(0)

    useEffect(() => {
        const cartProducts = cart.products

        const totalAmount = cartProducts.reduce((sum, product) => sum + (product.sellingPrice * product.qty), 0)

        const discount = cartProducts.reduce((sum, product) => sum + ((product.mrp - product.sellingPrice) * product.qty), 0)

        setSubTotal(totalAmount)
        setDiscount(discount)

    }, [cart])

    return (
        <div>
            <WebsiteBreadcrumb props={breadCrumb} />
            {cart.count === 0
                ?
                <div className='lg:w-screen lg:h-[400px] md:h-[350px] h-[300px] flex justify-center items-center lg:py-32 md:py-24 py-16'>
                    <div className='text-center px-4'>
                        <h4 className='lg:text-4xl md:text-3xl text-2xl font-semibold mb-5'>Your cart is empty!</h4>

                        <Button type="button" asChild className='lg:px-8 md:px-6 px-4 lg:py-3 md:py-2 py-2'>
                            <Link href={WEBSITE_SHOP}>Continue Shopping</Link>
                        </Button>

                    </div>
                </div>
                :
                <div className='flex lg:flex-nowrap flex-wrap lg:gap-8 gap-6 lg:my-20 md:my-16 my-10 lg:px-32 md:px-8 px-4'>
                    <div className='lg:w-[70%] w-full'>
                        <div className='overflow-x-auto'>
                            <table className='w-full border rounded-lg overflow-hidden'>
                                <thead className='border-b bg-gray-50 md:table-header-group hidden'>
                                    <tr>
                                        <th className='text-start p-3 font-semibold'>Product</th>
                                        <th className='text-center p-3 font-semibold'>Price</th>
                                        <th className='text-center p-3 font-semibold'>Quantity</th>
                                        <th className='text-center p-3 font-semibold'>Total</th>
                                        <th className='text-center p-3 font-semibold'>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.products.map(product => (
                                        <tr key={product.variantId} className='md:table-row block border-b last:border-b-0 hover:bg-gray-50'>
                                            <td className='p-3'>
                                                <div className='flex items-center lg:gap-5 md:gap-4 gap-3'>
                                                    <Image 
                                                        src={product.media || imgPlaceholder.src} 
                                                        width={60} 
                                                        height={60} 
                                                        alt={product.name} 
                                                        className='lg:w-16 lg:h-16 md:w-14 md:h-14 w-12 h-12 object-cover rounded'
                                                    />
                                                    <div className='min-w-0 flex-1'>
                                                        <h4 className='lg:text-lg md:text-base text-sm font-medium line-clamp-2 mb-1'>
                                                            <Link href={WEBSITE_PRODUCT_DETAILS(product.url)} className='hover:text-primary'>
                                                                {product.name}
                                                            </Link>
                                                        </h4>
                                                        <p className='text-xs text-gray-600'>Color: {product.color}</p>
                                                        <p className='text-xs text-gray-600'>Size: {product.size}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className='md:table-cell flex justify-between md:p-3 px-3 pb-2 text-center'>
                                                <span className='md:hidden font-medium text-sm'>Price</span>
                                                <span className='font-semibold lg:text-base text-sm'>
                                                    {product.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                </span>
                                            </td>
                                            <td className='md:table-cell flex justify-between md:p-3 px-3 pb-2'>
                                                <span className='md:hidden font-medium text-sm'>Quantity</span>
                                                <div className='flex justify-center'>
                                                    <div className="flex justify-center items-center lg:h-10 md:h-9 h-8 border w-fit rounded-full bg-white">
                                                        <button type="button" className="h-full lg:w-10 w-8 flex justify-center items-center cursor-pointer hover:bg-gray-100 rounded-l-full" onClick={() => dispatch(decreaseQuantity({ productId: product.productId, variantId: product.variantId }))}>
                                                            <HiMinus className='lg:text-base text-sm' />
                                                        </button>
                                                        <input type="text" value={product.qty} className="lg:w-14 md:w-12 w-10 text-center border-none outline-offset-0 lg:text-base text-sm" readOnly />
                                                        <button type="button" className="h-full lg:w-10 w-8 flex justify-center items-center cursor-pointer hover:bg-gray-100 rounded-r-full"
                                                            onClick={() => dispatch(increaseQuantity({ productId: product.productId, variantId: product.variantId }))}
                                                        >
                                                            <HiPlus className='lg:text-base text-sm' />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className='md:table-cell flex justify-between md:p-3 px-3 pb-2 text-center'>
                                                <span className='md:hidden font-medium text-sm'>Total</span>
                                                <span className='font-semibold lg:text-base text-sm text-primary'>
                                                    {(product.sellingPrice * product.qty).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                </span>
                                            </td>

                                            <td className='md:table-cell flex justify-between md:p-3 px-3 pb-2 text-center'>
                                                <span className='md:hidden font-medium text-sm'>Remove</span>
                                                <button type='button' onClick={() => dispatch(removeFromCart({ productId: product.productId, variantId: product.variantId }))} className='text-red-500 hover:text-red-700 p-1 rounded'>
                                                    <IoCloseCircleOutline className='lg:text-xl text-lg' />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className='lg:w-[30%] w-full'>
                        <div className='rounded-lg bg-gray-50 p-5 lg:sticky lg:top-5 shadow-sm'>
                            <h4 className='lg:text-lg text-base font-semibold mb-5'>Order Summary</h4>
                            <div>
                                <table className='w-full'>
                                    <tbody>
                                        <tr>
                                            <td className='font-medium py-2 text-sm lg:text-base'>Subtotal</td>
                                            <td className='text-end py-2 text-sm lg:text-base'>
                                                {subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className='font-medium py-2 text-sm lg:text-base'>Discount</td>
                                            <td className='text-end py-2 text-green-600 text-sm lg:text-base'>
                                                -{discount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </td>
                                        </tr>
                                        <tr className='border-t'>
                                            <td className='font-semibold py-3 lg:text-lg text-base'>Total</td>
                                            <td className='text-end py-3 font-semibold lg:text-lg text-base text-primary'>
                                                {subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                <Button type="button" asChild className="w-full bg-black rounded-full mt-5 mb-3 lg:py-3 py-2">
                                    <Link href={WEBSITE_CHECKOUT}>Proceed to Checkout</Link>
                                </Button>

                                <p className='text-center text-sm'>
                                    <Link href={WEBSITE_SHOP} className='hover:underline text-gray-600 hover:text-primary'>Continue Shopping</Link>
                                </p>

                            </div>
                        </div>
                    </div>

                </div>
            }
        </div>
    )
}

export default CartPage