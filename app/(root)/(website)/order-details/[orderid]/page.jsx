import WebsiteBreadcrumb from "@/components/Application/Website/WebsiteBreadcrumb"
import axios from "axios"
import Image from "next/image"
import placeholderImg from '@/public/assets/images/img-placeholder.webp'
import Link from "next/link"
import { WEBSITE_PRODUCT_DETAILS } from "@/routes/WebsiteRoute"
import { getBaseURL } from "@/lib/config" // Ensure you import this or use process.env

const OrderDetails = async ({ params }) => {
    // Await params as required in Next.js 15
    const { orderid } = await params
    
    // Fetch order data
    // Use absolute URL for server-side fetch
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/get/${orderid}`
    let orderData = null
    
    try {
        const res = await axios.get(apiUrl)
        orderData = res.data
    } catch (error) {
        console.error("Failed to fetch order:", error)
    }

    const breadcrumb = {
        title: 'Order Details',
        links: [{ label: 'Order Details' }]
    }
    
    return (
        <div>
            <WebsiteBreadcrumb props={breadcrumb} />
            <div className="lg:px-32 px-5 my-20">
                {!orderData || !orderData.success ? (
                    <div className="flex justify-center items-center py-32">
                        <h4 className="text-red-500 text-xl font-semibold">Order Not Found</h4>
                    </div>
                ) : (
                    <div>
                        <div className="mb-5">
                            <p><b>Order Id:</b> {orderData?.data?.order_id}</p>
                            <p><b>Transaction Id:</b> {orderData?.data?.payment_id}</p>
                            <p className="capitalize"><b>Status:</b> {orderData?.data?.status}</p>
                        </div>
                        <table className="w-full border">
                            <thead className="border-b bg-gray-50 md:table-header-group hidden">
                                <tr>
                                    <th className="text-start p-3">Product</th>
                                    <th className="text-center p-3">Price</th>
                                    <th className="text-center p-3">Quantity</th>
                                    <th className="text-center p-3">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderData?.data?.products?.map((product, index) => {
                                    // --- FIX: Handle both Variant and Simple Products ---
                                    const variant = product.variantId || {};
                                    const productInfo = product.productId || {};
                                    
                                    // Determine image source safely
                                    let imageSrc = placeholderImg.src;
                                    if (variant.media && variant.media.length > 0) {
                                        imageSrc = variant.media[0].secure_url || variant.media[0];
                                    } else if (productInfo.media && productInfo.media.length > 0) {
                                        imageSrc = productInfo.media[0].secure_url || productInfo.media[0];
                                    }

                                    // Generate a safe key using productId + variantId or index
                                    const key = `${productInfo._id || 'pid'}-${variant._id || index}`;

                                    return (
                                        <tr key={key} className="md:table-row block border-b">
                                            <td className="p-3">
                                                <div className="flex items-center gap-5">
                                                    <Image 
                                                        src={imageSrc} 
                                                        width={60} 
                                                        height={60} 
                                                        alt={productInfo.name || "Product"} 
                                                        className="rounded object-cover w-[60px] h-[60px]"
                                                        unoptimized // Important if using external urls without config
                                                    />
                                                    <div>
                                                        <h4 className="text-lg line-clamp-1">
                                                            <Link href={WEBSITE_PRODUCT_DETAILS(productInfo.slug || '#')}>
                                                                {productInfo.name || "Product Name"}
                                                            </Link>
                                                        </h4>
                                                        {/* --- FIX: Conditional Rendering for Variant Info --- */}
                                                        <p>Color: {variant.color || 'Default'}</p>
                                                        <p>Size: {variant.size || 'One Size'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="md:table-cell flex justify-between md:p-3 px-3 pb-2 text-center">
                                                <span className="md:hidden font-medium">Price</span>
                                                <span>{(product.sellingPrice || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                            </td>
                                            <td className="md:table-cell flex justify-between md:p-3 px-3 pb-2 text-center">
                                                <span className="md:hidden font-medium">Quantity</span>
                                                <span>{product.qty}</span>
                                            </td>
                                            <td className="md:table-cell flex justify-between md:p-3 px-3 pb-2 text-center">
                                                <span className="md:hidden font-medium">Total</span>
                                                <span>{((product.qty || 0) * (product.sellingPrice || 0)).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="grid md:grid-cols-2 grid-cols-1 gap-10 border mt-10">
                            <div className="p-5">
                                <h4 className="text-lg font-semibold mb-5">Shipping Address</h4>
                                <div>
                                    <table className="w-full">
                                        <tbody>
                                            <tr><td className="font-medium py-2">Name</td><td className="text-end py-2">{orderData?.data?.name}</td></tr>
                                            <tr><td className="font-medium py-2">Email</td><td className="text-end py-2">{orderData?.data?.email}</td></tr>
                                            <tr><td className="font-medium py-2">Phone</td><td className="text-end py-2">{orderData?.data?.phone}</td></tr>
                                            <tr><td className="font-medium py-2">Country</td><td className="text-end py-2">{orderData?.data?.country}</td></tr>
                                            <tr><td className="font-medium py-2">State</td><td className="text-end py-2">{orderData?.data?.state}</td></tr>
                                            <tr><td className="font-medium py-2">City</td><td className="text-end py-2">{orderData?.data?.city}</td></tr>
                                            <tr><td className="font-medium py-2">Pincode</td><td className="text-end py-2">{orderData?.data?.pincode}</td></tr>
                                            <tr><td className="font-medium py-2">Landmark</td><td className="text-end py-2">{orderData?.data?.landmark}</td></tr>
                                            <tr><td className="font-medium py-2">Order note</td><td className="text-end py-2">{orderData?.data?.ordernote || '---'}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="p-5 bg-gray-50">
                                <h4 className="text-lg font-semibold mb-5">Order Summary</h4>
                                <div>
                                    <table className="w-full">
                                        <tbody>
                                            <tr>
                                                <td className="font-medium py-2">Subtotal</td>
                                                <td className="text-end py-2">{(orderData?.data?.subtotal || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-medium py-2">Discount</td>
                                                <td className="text-end py-2">{(orderData?.data?.discount || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                                            </tr>
                                            <tr>
                                                <td className="font-medium py-2">Coupon Discount</td>
                                                <td className="text-end py-2">{(orderData?.data?.couponDiscountAmount || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                                            </tr>
                                            <tr>
                                                <td className="py-2 border-t font-bold mt-2">Total</td>
                                                <td className="text-end py-2 border-t font-bold mt-2">{(orderData?.data?.totalAmount || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    )
}

export default OrderDetails