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
import { useEffect, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { IoCloseCircleSharp } from "react-icons/io5"
import { FaShippingFast, FaClock } from "react-icons/fa"
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

    // Checkout session state
    const [checkoutSession, setCheckoutSession] = useState(null)
    const [csrfToken, setCsrfToken] = useState(null)
    const [sessionLoading, setSessionLoading] = useState(false)

    // Stock lock state
    const [stockLockId, setStockLockId] = useState(null)
    const [lockExpiresAt, setLockExpiresAt] = useState(null)
    const [lockTimeRemaining, setLockTimeRemaining] = useState(null)
    const [isStockLocked, setIsStockLocked] = useState(false)
    const [lockingStock, setLockingStock] = useState(false)

    const [isCouponApplied, setIsCouponApplied] = useState(false)
    const [subtotal, setSubTotal] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [couponDiscountAmount, setCouponDiscountAmount] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)
    const [couponLoading, setCouponLoading] = useState(false)
    const [couponCode, setCouponCode] = useState('')

    const [placingOrder, setPlacingOrder] = useState(false)
    const [savingOrder, setSavingOrder] = useState(false)

    const countdownIntervalRef = useRef(null)

    // Configure axios to include CSRF token in all requests
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
                    config.headers['X-CSRF-Token'] = csrfToken
                }
                return config
            },
            (error) => Promise.reject(error)
        )

        return () => {
            axios.interceptors.request.eject(requestInterceptor)
        }
    }, [csrfToken])

    // Create checkout session on mount
    useEffect(() => {
        if (cart.count > 0 && !checkoutSession) {
            createCheckoutSession()
        }
    }, [cart.count])

    // Map cart data for display
    useEffect(() => {
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
                qty: item.qty || 1,
                quantity: item.qty || 1
            }))
            setVerifiedCartData(cartData)
        } else {
            setVerifiedCartData([])
        }
    }, [cart.products, cart.count])

    // Calculate totals
    useEffect(() => {
        const cartProducts = cart.products
        const subTotalAmount = cartProducts.reduce((sum, product) => sum + (product.sellingPrice * (product.qty || 1)), 0)
        const discount = cartProducts.reduce((sum, product) => sum + ((product.mrp - product.sellingPrice) * (product.qty || 1)), 0)

        setSubTotal(subTotalAmount)
        setDiscount(discount)
        setTotalAmount(subTotalAmount - couponDiscountAmount)

        couponForm.setValue('minShoppingAmount', subTotalAmount)
    }, [cart, couponDiscountAmount])

    // Countdown timer for stock lock
    useEffect(() => {
        if (lockExpiresAt && isStockLocked) {
            // Clear any existing interval
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current)
            }

            // Update countdown every second
            countdownIntervalRef.current = setInterval(() => {
                const now = new Date().getTime()
                const expiryTime = new Date(lockExpiresAt).getTime()
                const timeLeft = expiryTime - now

                if (timeLeft <= 0) {
                    // Lock expired
                    clearInterval(countdownIntervalRef.current)
                    handleLockExpiration()
                } else {
                    setLockTimeRemaining(timeLeft)
                }
            }, 1000)

            return () => {
                if (countdownIntervalRef.current) {
                    clearInterval(countdownIntervalRef.current)
                }
            }
        }
    }, [lockExpiresAt, isStockLocked])

    /**
     * Create checkout session
     */
    const createCheckoutSession = async () => {
        setSessionLoading(true)
        try {
            const cartItems = cart.products.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.qty || 1,
                name: item.name,
                price: item.sellingPrice
            }))

            const { data: response } = await axios.post('/api/checkout/session', {
                cartItems
            })

            if (!response.success) {
                throw new Error(response.message)
            }

            setCheckoutSession(response.data.sessionToken)
            setCsrfToken(response.data.csrfToken)

            console.log('✅ Checkout session created')
        } catch (error) {
            showToast('error', error.response?.data?.message || error.message || 'Failed to create checkout session')
            console.error('Session creation error:', error)
        } finally {
            setSessionLoading(false)
        }
    }

    /**
     * Lock stock before payment
     */
    const lockStock = async () => {
        if (!checkoutSession) {
            showToast('error', 'Please refresh the page and try again')
            return false
        }

        setLockingStock(true)
        try {
            const items = cart.products.map(item => ({
                variantId: item.variantId,
                quantity: item.qty || 1
            }))

            const { data: response } = await axios.post('/api/stock/lock', {
                items,
                sessionToken: checkoutSession
            })

            if (!response.success) {
                throw new Error(response.message)
            }

            setStockLockId(response.data.lockId)
            setLockExpiresAt(response.data.expiresAt)
            setIsStockLocked(true)

            showToast('success', 'Stock reserved! Complete payment to confirm order')
            console.log('✅ Stock locked:', response.data.lockId)

            return true
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message
            showToast('error', errorMessage)
            console.error('Stock lock error:', error)
            return false
        } finally {
            setLockingStock(false)
        }
    }

    /**
     * Unlock stock on payment failure or cancellation
     */
    const unlockStock = async () => {
        if (!stockLockId) return

        try {
            const items = cart.products.map(item => ({
                variantId: item.variantId,
                quantity: item.qty || 1
            }))

            await axios.post('/api/stock/unlock', {
                items,
                sessionToken: checkoutSession
            })

            console.log('✅ Stock unlocked')
        } catch (error) {
            console.error('Stock unlock error:', error)
            // Don't show error to user - cleanup job will handle it
        }
    }

    /**
     * Handle lock expiration
     */
    const handleLockExpiration = () => {
        setIsStockLocked(false)
        setStockLockId(null)
        setLockExpiresAt(null)
        setLockTimeRemaining(null)

        showToast('error', 'Stock reservation expired. Please checkout again.', {
            duration: 5000
        })

        // Reset form but keep data
        // User can resubmit to lock again
    }

    /**
     * Format countdown timer
     */
    const formatTimeRemaining = (milliseconds) => {
        if (!milliseconds) return '0:00'

        const minutes = Math.floor(milliseconds / 60000)
        const seconds = Math.floor((milliseconds % 60000) / 1000)

        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

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
        setTotalAmount(subtotal - discount)
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

    // Get order ID for Razorpay
    const getOrderId = async (amount, formData) => {
        try {
            const cartItems = verifiedCartData.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.qty,
                name: item.name,
                price: item.sellingPrice
            }))

            const { data: orderIdData } = await axios.post('/api/payment/get-order-id', {
                amount,
                sessionToken: checkoutSession,
                cartItems,
                lockId: stockLockId,
                shippingAddress: {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    pincode: formData.pincode
                }
            })

            if (!orderIdData.success) {
                throw new Error(orderIdData.message)
            }

            return { success: true, order_id: orderIdData.data }
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message }
        }
    }

    const placeOrder = async (formData) => {
        // Prevent submission if session not ready
        if (!checkoutSession || sessionLoading) {
            showToast('error', 'Please wait for the page to load completely')
            return
        }

        setPlacingOrder(true)

        try {
            // Step 1: Lock stock BEFORE payment
            if (!isStockLocked) {
                const lockSuccess = await lockStock()
                if (!lockSuccess) {
                    setPlacingOrder(false)
                    return
                }
            }

            // Step 2: Generate order ID from server
            const generateOrderId = await getOrderId(totalAmount, formData)
            if (!generateOrderId.success) {
                throw new Error(generateOrderId.message)
            }

            const order_id = generateOrderId.order_id

            // Step 3: Prepare Razorpay options
            const razorpayOptions = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: totalAmount * 100,
                currency: "INR",
                name: "Narumugai",
                description: "Payment for your order",
                order_id: order_id,
                handler: async function (response) {
                    setSavingOrder(true)
                    try {
                        const products = verifiedCartData.map((cartItem) => ({
                            productId: cartItem.productId,
                            variantId: cartItem.variantId,
                            name: cartItem.name,
                            qty: cartItem.qty || 1,
                            mrp: cartItem.mrp,
                            sellingPrice: cartItem.sellingPrice,
                        }))

                        const stockLockItems = cart.products.map(item => ({
                            variantId: item.variantId,
                            quantity: item.qty || 1
                        }))

                        // Save the order after payment
                        const { data: paymentResponseData } = await axios.post('/api/payment/save-order', {
                            ...formData,
                            ...response,
                            products: products,
                            stockLockItems: stockLockItems,
                            userId: authStore?.auth?._id || undefined,
                            subtotal: subtotal,
                            discount: discount,
                            couponDiscountAmount: couponDiscountAmount,
                            totalAmount: totalAmount,
                        })

                        if (paymentResponseData.success) {
                            showToast('success', paymentResponseData.message)
                            dispatch(clearCart())
                            orderForm.reset()

                            // Clear stock lock state (successfully used)
                            setIsStockLocked(false)
                            setStockLockId(null)
                            setLockExpiresAt(null)

                            router.push(WEBSITE_ORDER_DETAILS(response.razorpay_order_id))
                        } else {
                            showToast('error', paymentResponseData.message)
                        }
                    } catch (error) {
                        console.error('Error saving order:', error)
                        showToast('error', error.response?.data?.message || error.message || 'Error processing your order')
                    } finally {
                        setSavingOrder(false)
                    }
                },
                modal: {
                    ondismiss: async function() {
                        // User closed modal without payment - unlock stock
                        await unlockStock()
                        setIsStockLocked(false)
                        setStockLockId(null)
                        setLockExpiresAt(null)
                        showToast('info', 'Payment cancelled. Stock has been released.')
                        setPlacingOrder(false)
                    }
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: "#7c3aed"
                }
            }

            // Step 4: Load Razorpay script
            const loadRazorpayScript = () => {
                return new Promise((resolve, reject) => {
                    if (window.Razorpay) {
                        resolve()
                        return
                    }

                    let script = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')

                    if (!script) {
                        script = document.createElement('script')
                        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
                        script.async = true
                        script.onload = () => setTimeout(() => resolve(), 300)
                        script.onerror = () => reject(new Error('Failed to load Razorpay script'))
                        document.body.appendChild(script)
                    } else {
                        if (window.Razorpay) {
                            resolve()
                        } else {
                            const checkInterval = setInterval(() => {
                                if (window.Razorpay) {
                                    clearInterval(checkInterval)
                                    resolve()
                                }
                            }, 100)

                            setTimeout(() => {
                                clearInterval(checkInterval)
                                reject(new Error('Razorpay script loading timeout'))
                            }, 10000)
                        }
                    }
                })
            }

            await loadRazorpayScript()

            // Step 5: Open Razorpay payment modal
            const rzp = new window.Razorpay(razorpayOptions)

            // Handle payment failure
            rzp.on('payment.failed', async function (response) {
                // Unlock stock on payment failure
                await unlockStock()
                setIsStockLocked(false)
                setStockLockId(null)
                setLockExpiresAt(null)

                showToast('error', response.error.description || 'Payment failed')
                setPlacingOrder(false)
            })

            rzp.open()

        } catch (error) {
            showToast('error', error.message)

            // Unlock stock on error
            if (isStockLocked) {
                await unlockStock()
                setIsStockLocked(false)
                setStockLockId(null)
                setLockExpiresAt(null)
            }
        } finally {
            // Don't set placingOrder to false here - modal ondismiss handles it
        }
    }

    return (
        <div>
            {/* Order saving overlay */}
            {savingOrder && (
                <div className='h-screen w-screen fixed top-0 left-0 z-50 bg-black/10 flex justify-center items-center'>
                    <div className='flex flex-col items-center'>
                        <img src="/assets/images/loading.svg" width="80" height="80" alt='Loading' />
                        <h4 className='font-semibold mt-4'>Processing your order...</h4>
                    </div>
                </div>
            )}

            {/* Session loading overlay */}
            {sessionLoading && (
                <div className='h-screen w-screen fixed top-0 left-0 z-40 bg-black/5 flex justify-center items-center'>
                    <div className='flex flex-col items-center'>
                        <img src="/assets/images/loading.svg" width="60" height="60" alt='Loading' />
                        <h4 className='font-medium mt-4'>Preparing checkout...</h4>
                    </div>
                </div>
            )}

            <WebsiteBreadcrumb props={breadCrumb} />

            {cart.count === 0 ? (
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
                        {/* Stock Lock Status */}
                        {isStockLocked && lockTimeRemaining && (
                            <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between'>
                                <div className='flex items-center gap-2 text-green-700'>
                                    <FaClock size={20} />
                                    <span className='font-medium'>Stock reserved for</span>
                                </div>
                                <div className={`text-2xl font-bold ${lockTimeRemaining < 60000 ? 'text-red-600' : 'text-green-700'}`}>
                                    {formatTimeRemaining(lockTimeRemaining)}
                                </div>
                            </div>
                        )}

                        <div className='flex font-semibold gap-2 items-center mb-5'>
                            <FaShippingFast size={25} /> Shipping Address:
                        </div>

                        <Form {...orderForm}>
                            <form onSubmit={orderForm.handleSubmit(placeOrder)} className='grid grid-cols-2 gap-5'>
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
                                        text={isStockLocked ? "Proceed to Payment" : "Reserve Stock & Pay"}
                                        loading={placingOrder || lockingStock}
                                        disabled={sessionLoading || placingOrder || lockingStock}
                                        className="bg-primary hover:bg-primary/90 rounded-full px-8 py-2 cursor-pointer"
                                    />
                                </div>
                            </form>
                        </Form>
                    </div>

                    {/* Order Summary */}
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
                                                                unoptimized
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

                            {/* Price Summary */}
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

                            {/* Coupon Section */}
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
