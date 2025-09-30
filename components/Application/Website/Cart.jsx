'use client'
import { BsCart2 } from "react-icons/bs";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { useDispatch, useSelector } from "react-redux";
import Image from "next/image";
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import Link from "next/link";
import { WEBSITE_CART, WEBSITE_CHECKOUT } from "@/routes/WebsiteRoute";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { showToast } from "@/lib/showToast";
import { Plus, Minus } from 'lucide-react';
import { 
  removeCartItem, 
  updateCartItem 
} from "@/lib/cartAPI";

const Cart = () => {
    const [open, setOpen] = useState(false);
    const [subtotal, setSubTotal] = useState(0);
    const [discount, setDiscount] = useState(0);

    const cart = useSelector(store => store.cartStore);
    const dispatch = useDispatch();

    useEffect(() => {
        if (cart.products && cart.products.length > 0) {
            // Calculate subtotal from cart products
            const totalAmount = cart.products.reduce((sum, product) => {
                const price = product.variantDetails?.sellingPrice || product.sellingPrice || 0;
                return sum + (price * (product.qty || 1));
            }, 0);

            const discountValue = cart.products.reduce((sum, product) => {
                const sellingPrice = product.variantDetails?.sellingPrice || product.sellingPrice || 0;
                const mrp = product.variantDetails?.mrp || product.mrp || 0;
                return sum + ((mrp - sellingPrice) * (product.qty || 1));
            }, 0);

            setSubTotal(totalAmount);
            setDiscount(discountValue);
        } else {
            setSubTotal(0);
            setDiscount(0);
        }
    }, [cart]);

    const handleRemoveFromCart = async (productId, variantId) => {
        await removeCartItem(dispatch, variantId);
    };

    const handleIncreaseQuantity = async (productId, variantId) => {
        const product = cart.products.find(p => p.variantId === variantId);
        if (product) {
            const newQty = (product.qty || 1) + 1;
            // Check if we're limited by stock
            if (newQty <= (product.variantDetails?.stock || Infinity)) {
                await updateCartItem(dispatch, { variantId, qty: newQty });
            } else {
                showToast('error', 'Not enough stock available');
            }
        }
    };

    const handleDecreaseQuantity = async (productId, variantId) => {
        const product = cart.products.find(p => p.variantId === variantId);
        if (product && (product.qty || 1) > 1) {
            const newQty = (product.qty || 1) - 1;
            await updateCartItem(dispatch, { variantId, qty: newQty });
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen} >
            <SheetTrigger className="relative">
                <BsCart2 size={25} className="text-gray-500 hover:text-primary" />
                {cart.count > 0 && (
                    <span className="absolute bg-red-500 text-white text-xs rounded-full w-4 h-4 flex justify-center items-center -right-2 -top-1">{cart.count}</span>
                )}
            </SheetTrigger>
            <SheetContent className="sm:max-w-[450px] w-full">
                <SheetHeader className='py-2'>
                    <SheetTitle className="text-2xl">My Cart</SheetTitle>
                    <SheetDescription></SheetDescription>
                </SheetHeader>

                <div className="h-[calc(100vh-40px)] pb-10 ">
                    <div className="h-[calc(100%-128px)]  overflow-auto px-2">
                        {cart.count === 0 && <div className="h-full flex justify-center items-center text-xl font-semibold">
                            Your Cart Is Empty.
                        </div>}

                        {cart.products?.map(product => (
                            <div key={product.variantId} className="flex justify-between items-center gap-5 mb-4 border-b pb-4">
                                <div className="flex gap-5 items-center">
                                    <Image 
                                        src={product?.media || product?.product?.media?.[0]?.secure_url || imgPlaceholder.src} 
                                        height={100} 
                                        width={100} 
                                        alt={product?.name || product?.product?.name} 
                                        className="w-20 h-20 rounded border" 
                                        onError={(e) => {
                                            e.target.src = imgPlaceholder.src;
                                        }}
                                    />

                                    <div >
                                        <h4 className="text-lg mb-1">{product?.name || product?.product?.name}</h4>
                                        <p className="text-gray-500">
                                            {product?.variantDetails?.size}/{product?.variantDetails?.color}
                                        </p>
                                    </div>

                                </div>

                                <div>
                                    <button 
                                        type="button" 
                                        className="text-red-500 underline underline-offset-1 mb-2 cursor-pointer"
                                        onClick={() => handleRemoveFromCart(product.productId, product.variantId)}
                                    >
                                        Remove
                                    </button>

                                    <div className="flex items-center gap-2 mb-2">
                                        <Button 
                                            type="button" 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => handleDecreaseQuantity(product.productId, product.variantId)}
                                            className="w-6 h-6 p-0"
                                        >
                                            <Minus className="w-3 h-3" />
                                        </Button>
                                        <span className="w-8 text-center text-sm font-medium">{product.qty || 1}</span>
                                        <Button 
                                            type="button" 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => handleIncreaseQuantity(product.productId, product.variantId)}
                                            className="w-6 h-6 p-0"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>

                                    <p className="font-semibold">
                                        {product.qty || 1} X {(product.variantDetails?.sellingPrice || product.sellingPrice || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </p>

                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="h-32 border-t pt-5 px-2">
                        <h2 className="flex justify-between items-center text-lg font-semibold">
                            <span>Subtotal</span> 
                            <span>{subtotal?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                        </h2>
                        <h2 className="flex justify-between items-center text-lg font-semibold">
                            <span>Discount</span> 
                            <span>{discount?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                        </h2>

                        <div className="flex justify-between mt-3 gap-5">
                            <Button 
                                type="button" 
                                asChild 
                                variant="secondary" 
                                className="w-[200px]" 
                                onClick={() => setOpen(false)}
                            >
                                <Link href={WEBSITE_CART}>View Cart</Link>
                            </Button>
                            <Button 
                                type="button" 
                                asChild 
                                className="w-[200px]" 
                                onClick={() => setOpen(false)}
                            >
                                {cart.count > 0 ? (
                                    <Link href={WEBSITE_CHECKOUT}>Checkout</Link>
                                ) : (
                                    <button 
                                        type="button" 
                                        onClick={() => showToast('error', 'Your cart is empty!')}
                                    >
                                        Checkout
                                    </button>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default Cart