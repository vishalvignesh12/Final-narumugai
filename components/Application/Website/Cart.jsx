'use client'
import React, { useState, useEffect } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import { Button } from '@/components/ui/button'
import { WEBSITE_CART, WEBSITE_CHECKOUT } from '@/routes/WebsiteRoute'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import Link from 'next/link'
import Image from 'next/image'
import { showToast } from "@/lib/showToast";
import { Plus, Minus } from 'lucide-react';

// --- *** FIX *** ---
// Import actions from the REDUCER, not the API lib
import { removeProduct, updateProductQty } from "@/store/reducer/cartReducer";
// --- *** END OF FIX *** ---

const Cart = () => {
    const [open, setOpen] = useState(false);
    const cart = useSelector(store => store.cartStore);
    const dispatch = useDispatch();
    const [subtotal, setSubtotal] = useState(0);

    useEffect(() => {
        const total = cart.products.reduce((sum, product) => {
            return sum + (product.sellingPrice * (product.qty || 1));
        }, 0);
        setSubtotal(total);
    }, [cart.products]);

    // --- *** FIX *** ---
    // Dispatch the local Redux action `removeProduct`
    const handleRemove = (variantId) => {
        if (confirm("Are you sure you want to remove this item?")) {
            dispatch(removeProduct(variantId));
            showToast('success', 'Item removed from cart');
        }
    };

    // --- *** FIX *** ---
    // Dispatch the local Redux action `updateProductQty`
    const handleQuantityChange = (variantId, newQty) => {
        if (newQty < 1) {
            handleRemove(variantId); // Remove if quantity goes below 1
        } else {
            dispatch(updateProductQty({ variantId, qty: newQty }));
        }
    };
    // --- *** END OF FIX *** ---

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative rounded-full">
                    <ShoppingCart className="h-5 w-5" />
                    {cart.count > 0 && (
                        <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                            {cart.count}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col">
                <SheetHeader>
                    <SheetTitle>Shopping Cart ({cart.count} {cart.count === 1 ? 'item' : 'items'})</SheetTitle>
                    <SheetDescription>
                        Review your items before proceeding to checkout.
                    </SheetDescription>
                </SheetHeader>
                
                {cart.count === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <ShoppingCart size={60} className="text-gray-300 mb-4" />
                        <p className="text-lg font-semibold">Your cart is empty</p>
                        <p className="text-sm text-gray-500 mb-4">Looks like you haven't added anything yet.</p>
                        <SheetClose asChild>
                            <Button asChild>
                                <Link href="/shop">Start Shopping</Link>
                            </Button>
                        </SheetClose>
                    </div>
                ) : (
                    <>
                        {/* Cart Items List */}
                        <div className="flex-1 overflow-y-auto pr-4 -mr-6">
                            <div className="flex flex-col gap-4">
                                {cart.products.map(product => (
                                    <div key={product.variantId} className="flex items-start gap-4 p-4 border rounded-lg">
                                        <div className="flex-shrink-0">
                                            <Image
                                                src={product.media || '/assets/images/img-placeholder.webp'}
                                                width={80}
                                                height={100}
                                                alt={product.name}
                                                className="rounded-md object-cover w-20 h-24"
                                                unoptimized
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-sm truncate">
                                                <Link href={product.url ? `/product/${product.url}` : '#'} onClick={() => setOpen(false)}>
                                                    {product.name}
                                                </Link>
                                            </h4>
                                            <p className="text-xs text-gray-500">Color: {product.color}</p>
                                            <p className="text-xs text-gray-500 mb-2">Size: {product.size}</p>
                                            
                                            {/* Quantity Control */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => handleQuantityChange(product.variantId, (product.qty || 1) - 1)}
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="text-sm font-medium w-6 text-center">{product.qty || 1}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => handleQuantityChange(product.variantId, (product.qty || 1) + 1)}
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-between h-24">
                                            <p className="font-semibold text-sm">
                                                {product.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-400 hover:text-red-500"
                                                onClick={() => handleRemove(product.variantId)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer with totals and checkout buttons */}
                        <SheetFooter className="mt-6 pt-6 border-t">
                            <div className="w-full space-y-4">
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Subtotal</span>
                                    <span>{subtotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                </div>
                                <SheetClose asChild>
                                    <Button asChild size="lg" className="w-full">
                                        <Link href={WEBSITE_CHECKOUT}>Proceed to Checkout</Link>
                                    </Button>
                                </SheetClose>
                                <SheetClose asChild>
                                    <Button asChild variant="outline" size="lg" className="w-full">
                                        <Link href={WEBSITE_CART}>View Full Cart</Link>
                                    </Button>
                                </SheetClose>
                            </div>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}

export default Cart