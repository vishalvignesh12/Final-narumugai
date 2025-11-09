'use client'
import ButtonLoading from '@/components/Application/ButtonLoading'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { showToast } from '@/lib/showToast'
import { zSchema } from '@/lib/zodSchema'
import { WEBSITE_ORDER_DETAILS, WEBSITE_PRODUCT_DETAILS, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import { clearCart } from '@/store/reducer/cartReducer'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react' // Import useRef
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { IoCloseCircleSharp } from "react-icons/io5"
import { FaShippingFast } from "react-icons/fa"
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

const breadCrumb = {
    title: 'Checkout',
    links: [
        { label: "Checkout" }
    ]
}

const Checkout = () => {
    const router = useRouter()
    const dispatch = useDispatch()
    const cart = useSelector(store => store.cartStore)
    const authStore = useSelector(store => store.authStore)
    const [verifiedCartData, setVerifiedCartData] = useState([])
    const [loadingCart, setLoadingCart] = useState(false)

    const [isCouponApplied, setIsCouponApplied] = useState(false)
    const [subtotal, setSubTotal] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [couponDiscountAmount, setCouponDiscountAmount] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)
    const [couponLoading, setCouponLoading] = useState(false)
    const [couponCode, setCouponCode] = useState('')

    const [placingOrder, setPlacingOrder] = useState(false)
    
    // Create a ref for the auto-submitting form
    const payuFormRef = useRef(null)
    const [payuData, setPayuData] = useState(null)

    useEffect(() => {
        // Map cart data for display
        if (cart.count > 0) {
            const cartData = cart.products.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                name: item.name,
                url: item.url || item.slug || '',
                size: item.size,
                color: item.color,
                mrp: item.mrp,
                sellingPrice: item.sellingPrice,
                media: item.media,
                qty: item.qty || 1
            }))
            setVerifiedCartData(cartData)
        } else {
            setVerifiedCartData([])
        }
    }, [cart.products, cart.count])

    useEffect(() => {
        const cartProducts = cart.products

        const subTotalAmount = cartProducts.reduce((sum, product) => sum + (product.sellingPrice * (product.qty || 1)), 0)
        const discount = cartProducts.reduce((sum, product) => sum + ((product.mrp - product.sellingPrice) * (product.qty || 1)), 0)

        setSubTotal(subTotalAmount)
        setDiscount(discount)
        setTotalAmount(subTotalAmount)

        couponForm.setValue('minShoppingAmount', subTotalAmount)
    }, [cart])

    // Coupon form
    const couponFormSchema = zSchema.pick({
        code: true,
        minShoppingAmount: true
    })

    const couponForm = useForm({
        resolver: zodResolver(couponFormSchema),
        defaultValues: {
            code: "",
            minShoppingAmount: subtotal
        }
    })

    const applyCoupon = async (values) => {
        setCouponLoading(true)
        try {
            const { data: response } = await axios.post('/api/coupon/apply', values)
            if (!response.success) {
                throw new Error(response.message)
            }

            const discountPercentage = response.data.discountPercentage
            const discountAmount = (subtotal * discountPercentage) / 100
            
            setCouponDiscountAmount(discountAmount)
            setTotalAmount(subtotal - discountAmount)
            showToast('success', response.message)
            setCouponCode(couponForm.getValues('code'))
            setIsCouponApplied(true)
            couponForm.resetField('code')
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setCouponLoading(false)
        }
    }

    const removeCoupon = () => {
        setIsCouponApplied(false)
        setCouponCode('')
        setCouponDiscountAmount(0)
        setTotalAmount(subtotal - discount) // Reset to subtotal minus regular discount
    }

    // Order form
    const orderFormSchema = zSchema.pick({
        name: true,
        email: true,
        phone: true,
        country: true,
        state: true,
        city: true,
        pincode: true,
        landmark: true,
        ordernote: true
    })

    const orderForm = useForm({
        resolver: zodResolver(orderFormSchema),
        defaultValues: {
            name: authStore?.auth?.name || '',
            email: authStore?.auth?.email || '',
            phone: authStore?.auth?.phone || '',
            country: '',
            state: '',
            city: '',
            pincode: '',
            landmark: '',
            ordernote: '',
        }
    })

    // NEW: Function to submit the hidden PayU form
    useEffect(() => {
        if (payuData && payuFormRef.current) {
            payuFormRef.current.submit();
            // Clear cart from Redux immediately after getting redirect data
            dispatch(clearCart());
        }
    }, [payuData, dispatch]);

    // MODIFIED: placeOrder function for PayU
    const placeOrder = async (formData) => {
        setPlacingOrder(true);
        try {
            // Prepare cart products data
            const products = verifiedCartData.map((cartItem) => ({
                productId: cartItem.productId,
                variantId: cartItem.variantId,
                name: cartItem.name,
                qty: cartItem.qty || 1,
                mrp: cartItem.mrp,
                sellingPrice: cartItem.sellingPrice,
            }));

            // Call our new API to create a pending order and get PayU details
            const { data: response } = await axios.post('/api/payment/initiate-payment', {
                ...formData,
                products: products,
                subtotal: subtotal,
                discount: discount,
                couponDiscountAmount: couponDiscountAmount,
                totalAmount: totalAmount,
            });

            if (!response.success) {
                throw new Error(response.message || 'Failed to initiate payment');
            }
            
            // Set the PayU data, which will trigger the useEffect to submit the form
            setPayuData(response.data);

            // Note: We don't clear cart or reset form here anymore.
            // The useEffect will submit the form, and the user will be redirected.
            // Cart is cleared in the useEffect.

        } catch (error) {
            console.error('Error placing order:', error);
            showToast('error', error.message || 'Error processing your order');
            setPlacingOrder(false);
        }
        // No finally block to set placingOrder(false) because the user is being redirected
    }

    // NEW: Render a hidden form for PayU
    const renderPayUForm = () => {
        if (!payuData) return null;
        
        return (
            <form ref={payuFormRef} action={payuData.endpoint} method="POST" className="hidden">
                <input type="hidden" name="key" value={payuData.key} />
                <input type="hidden" name="txnid" value={payuData.txnid} />
                <input type="hidden" name="productinfo" value={payuData.productinfo} />
                <input type="hidden" name="amount" value={payuData.amount} />
                <input type="hidden" name="email" value={payuData.email} />
                <input type="hidden" name="firstname" value={payuData.firstname} />
                <input type="hidden" name="surl" value={payuData.surl} />
                <input type="hidden" name="furl" value={payuData.furl} />
                <input type="hidden" name="phone" value={payuData.phone} />
                <input type="hidden" name="hash" value={payuData.hash} />
                {/* Optional fields can be added here if needed, e.g., address */}
            </form>
        );
    }

    return (
        <div>
            {/* Show a message while redirecting */}
            {placingOrder && (
                <div className='h-screen w-screen fixed top-0 left-0 z-50 bg-black/10 flex justify-center items-center'>
                    <div className='flex flex-col items-center'>
                        <img src="/assets/images/loading.svg" width="80" height="80" alt='Loading' />
                        <h4 className='font-semibold mt-4'>Redirecting to payment gateway...</h4>
                    </div>
                </div>
            )}
            
            {/* Hidden PayU form */}
            {renderPayUForm()}

            <WebsiteBreadcrumb props={breadCrumb} />

            {cart.count === 0 && !placingOrder ? (
                <div className='w-screen h-[500px] flex justify-center items-center py-32'>
                    <div className='text-center'>
                        <h4 className='text-4xl font-semibold mb-5'>Your cart is empty!</h4>
                        <Button type="button" asChild>
                            <Link href={WEBSITE_SHOP}>Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className='flex lg:flex-nowrap flex-wrap gap-10 my-20 lg:px-32 px-4'>
                    {/* Shipping Address Form */}
                    <div className='lg:w-[60%] w-full'>
                        <div className='flex font-semibold gap-2 items-center mb-5'>
                            <FaShippingFast size={25} /> Shipping Address:
                        </div>

                        <Form {...orderForm}>
                            <form onSubmit={orderForm.handleSubmit(placeOrder)} className='grid grid-cols-2 gap-5'>
                                {/* ... (All your FormField components for name, email, phone, etc. remain UNCHANGED) ... */}
                                {/* Name Field */}
                                <FormField
                                    control={orderForm.control}
                                    name='name'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Full name*" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Email Field */}
                                <FormField
                                    control={orderForm.control}
                                    name='email'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input type="email" placeholder="Email*" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Phone Field */}
                                <FormField
                                    control={orderForm.control}
                                    name='phone'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Phone*" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Country Field */}
                                <FormField
                                    control={orderForm.control}
                                    name='country'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Country*" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* State Field */}
                                <FormField
                                    control={orderForm.control}
                                    name='state'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="State*" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* City Field */}
                                <FormField
                                    control={orderForm.control}
                                    name='city'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="City*" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Pincode Field */}
                                <FormField
                                    control={orderForm.control}
                                    name='pincode'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Pincode*" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Landmark Field */}
                                <FormField
                                    control={orderForm.control}
                                    name='landmark'
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="Landmark*" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Order Note Field */}
                                <div className='mb-3 col-span-2'>
                                    <FormField
                                        control={orderForm.control}
                                        name='ordernote'
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Textarea placeholder="Enter order note (optional)" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>


                                {/* Place Order Button */}
                                <div className='mb-3'>
                                    <ButtonLoading 
                                        type="submit" 
                                        text="Place Order & Proceed to Pay" 
                                        loading={placingOrder} 
                                        className="bg-primary hover:bg-primary/90 rounded-full px-8 py-2 cursor-pointer" 
                                    />
                                </div>
                            </form>
                        </Form>
                    </div>

                    {/* Order Summary (UNCHANGED) */}
                    <div className='lg:w-[40%] w-full'>
                        <div className='rounded bg-gray-50 p-5 sticky top-5'>
                            <h4 className='text-lg font-semibold mb-5'>Order Summary</h4>
                            
                            <div className="mb-6">
                                <table className='w-full'>
                                    <tbody>
                                        {verifiedCartData.map(product => (
                                            <tr key={product.variantId} className="border-b">
                                                <td className='py-3'>
                                                    <div className='flex items-center gap-3'>
                                                        <div className="w-16 h-16">
                                                            <Image 
                                                                src={product.media} 
                                                                width={64} 
                                                                height={64} 
                                                                alt={product.name} 
                                                                className='rounded object-cover w-full h-full'
                                                                unoptimized // For external images
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <h4 className='font-medium line-clamp-1 text-sm'>
                                                                <Link href={WEBSITE_PRODUCT_DETAILS(product.url)}>
                                                                    {product.name}
                                                                </Link>
                                                            </h4>
                                                            <p className='text-xs text-gray-600'>Color: {product.color}</p>
                                                            <p className='text-xs text-gray-600'>Size: {product.size}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='py-3 text-right'>
                                                    <p className='text-sm'>
                                                        {product.qty} x {product.mrp > product.sellingPrice ? (
                                                            <>
                                                                <span className="line-through text-gray-400 text-sm">{product.mrp.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                                                <span className="font-medium ml-2">{product.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                                            </>
                                                        ) : (
                                                            <span className="font-medium">{product.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                                        )}
                                                    </p>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Price Summary (UNCHANGED) */}
                            <div className="border-t pt-4">
                                <div className="flex justify-between mb-2">
                                    <span>MRP Total</span>
                                    <span>{(subtotal + discount).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                </div>
                                
                                {discount > 0 && (
                                    <div className="flex justify-between mb-2">
                                        <span>You Save</span>
                                        <span className="text-green-600">- {discount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                    </div>
                                )}
                                
                                {isCouponApplied && couponDiscountAmount > 0 && (
                                    <div className="flex justify-between mb-2">
                                        <span>Coupon Discount</span>
                                        <span className="text-green-600">- {couponDiscountAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                    </div>
                                )}
                                
                                <div className="flex justify-between mt-4 pt-4 border-t font-bold text-lg">
                                    <span>You Pay</span>
                                    <span>{totalAmount.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                </div>
                            </div>

                            {/* Coupon Section (UNCHANGED) */}
                            <div className='mt-6'>
                                {!isCouponApplied ? (
                                    <Form {...couponForm}>
                                        <form onSubmit={couponForm.handleSubmit(applyCoupon)} className='flex gap-3'>
                                            <FormField
                                                control={couponForm.control}
                                                name='code'
                                                render={({ field }) => (
                                                    <FormItem className="flex-1">
                                                        <FormControl>
                                                            <Input placeholder="Enter coupon code" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <ButtonLoading 
                                                type="submit" 
                                                text="Apply" 
                                                className="bg-gray-800 hover:bg-gray-700" 
                                                loading={couponLoading} 
                                            />
                                        </form>
                                    </Form>
                                ) : (
                                    <div className='flex justify-between items-center p-3 rounded-lg bg-green-100'>
                                        <div>
                                            <span className='text-xs'>Coupon Applied:</span>
                                            <p className='font-semibold'>{couponCode}</p>
                                        </div>
                                        <button 
                                            type='button' 
                                            onClick={removeCoupon} 
                                            className='text-red-500 hover:text-red-700 cursor-pointer'
                                        >
                                            <IoCloseCircleSharp size={25} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Checkout