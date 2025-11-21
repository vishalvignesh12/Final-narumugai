"use client";

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { z } from "zod"
import { couponSchema } from '@/lib/zodSchema'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import useFetch from '@/hooks/useFetch'


const breadCrumb = [
    {
        label: "Coupon",
        link: "/admin/coupon"
    },
    {
        label: "Add",
    }
]

const AddCouponPage = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const { data: products, loading: productLoading } = useFetch('/api/product/get-featured-product')
    const { data: categories, loading: categoryLoading } = useFetch('/api/category/get-category')

    const form = useForm({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            code: "",
            discountType: "percentage",
            discountValue: 0,
            expirationDate: null,
            usageLimit: 0,
            minimumPurchase: 0,
            product: "all",
            category: "all",
        },
    })

    async function onSubmit(values) {
        try {
            setLoading(true)
            const response = await axios.post('/api/coupon/create', values)
            const data = response.data
            if (data.success) {
                showToast(data.message)
                router.push('/admin/coupon')
            }
        } catch (error) {
            showToast(error.response.data.message || 'Error', 'error')
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='border rounded-lg p-4'>
            <BreadCrumb breadcrumbData={breadCrumb} />
            <div className='max-w-xl'>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Coupon Code</FormLabel>
                                    <FormControl>
                                        <Input placeholder="eg: Saree" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="discountType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select discount type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="fixed">Fixed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="discountValue"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Discount Value</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="eg: 10" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="expirationDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Expiration Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-[240px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="usageLimit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Usage Limit</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="eg: 100" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="minimumPurchase"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Minimum Purchase</FormLabel>
                                    <FormControl>
                                        <Input type="number" placeholder="eg: 50" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="product"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select product" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="all">All Products</SelectItem>
                                            {/* ##### THIS IS THE FIXED LINE ##### */}
                                            {products?.length > 0 && products.map((product) => (
                                                <SelectItem key={product._id} value={product._id}>{product.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="all">All Categories</SelectItem>
                                            {/* ##### THIS IS THE FIXED LINE ##### */}
                                            {categories?.length > 0 && categories.map((category) => (
                                                <SelectItem key={category._id} value={category._id}>{category.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <ButtonLoading loading={loading} type="submit">Submit</ButtonLoading>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default AddCouponPage