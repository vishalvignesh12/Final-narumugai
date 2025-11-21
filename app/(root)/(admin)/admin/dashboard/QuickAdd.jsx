'use client'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { zSchema } from '@/lib/zodSchema'
import { ADMIN_CATEGORY_ADD, ADMIN_PRODUCT_ADD } from '@/routes/AdminPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { showToast } from '@/lib/showToast'

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"


const QuickAdd = () => {

    const router = useRouter()
    const [productLoading, setProductLoading] = useState(false)
    const [categoryLoading, setCategoryLoading] = useState(false)
    
    // FIX: Derive schemas using .pick() instead of destructuring non-existent properties
    const productSchema = zSchema.pick({ name: true, slug: true });
    const categorySchema = zSchema.pick({ name: true, slug: true });

    // Form for Products
    const productForm = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            slug: ""
        }
    })

    // Form for Categories
    const categoryForm = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            slug: ""
        }
    })

    const onSubmitProduct = async (values) => {
        setProductLoading(true)
        try {
            const { data } = await axios.post('/api/product/create', { ...values, quickAdd: true })
            if (data.success) {
                showToast('success', data.message)
                productForm.reset()
                router.push(ADMIN_PRODUCT_ADD)
            }
        } catch (error) {
            showToast('error', error.response ? error.response.data.message : error.message)
        } finally {
            setProductLoading(false)
        }
    }

    // --- Submit handler for Category ---
    const onSubmitCategory = async (values) => {
        setCategoryLoading(true)
        try {
            const { data } = await axios.post('/api/category/create', { ...values, quickAdd: true })
            if (data.success) {
                showToast('success', data.message)
                categoryForm.reset()
                router.push(ADMIN_CATEGORY_ADD)
            }
        } catch (error) {
            showToast('error', error.response ? error.response.data.message : error.message)
        } finally {
            setCategoryLoading(false)
        }
    }

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Quick Add</CardTitle>
                <CardDescription>Quickly create a new product or category.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="product" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="product">Product</TabsTrigger>
                        <TabsTrigger value="category">Category</TabsTrigger>
                    </TabsList>
                    <TabsContent value="product">
                        <Form {...productForm}>
                            <form onSubmit={productForm.handleSubmit(onSubmitProduct)} className='space-y-4 pt-4'>
                                <FormField
                                    control={productForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter product name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={productForm.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Product Slug</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter product slug" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={productLoading} className="w-full">
                                    {productLoading ? <ButtonLoading /> : "Add Product"}
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                    
                    <TabsContent value="category">
                        <Form {...categoryForm}>
                            <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className='space-y-4 pt-4'>
                                <FormField
                                    control={categoryForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter category name" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={categoryForm.control}
                                    name="slug"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Category Slug</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter category slug" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={categoryLoading} className="w-full">
                                    {categoryLoading ? <ButtonLoading /> : "Add Category"}
                                </Button>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}

export default QuickAdd