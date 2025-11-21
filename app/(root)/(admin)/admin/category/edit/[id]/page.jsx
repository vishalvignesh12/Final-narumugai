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
import { categorySchema } from '@/lib/zodSchema'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { useEffect, useState } from 'react'
import MediaModal from '@/components/Application/Admin/MediaModal'
import Image from 'next/image'
import { Textarea } from '@/components/ui/textarea'
import useFetch from '@/hooks/useFetch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Loading from '@/components/Application/Loading';


const breadCrumb = [
    {
        label: "Category",
        link: "/admin/category"
    },
    {
        label: "Edit",
    }
]

const EditCategoryPage = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [media, setMedia] = useState(null)
    const { id } = useParams()
    const { data: category, loading: categoryLoading } = useFetch(`/api/category/get/${id}`)
    const { data: categories, loading: categoriesLoading } = useFetch('/api/category/get-category')


    const form = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            parent: "",
        },
    })

    useEffect(() => {
        if (category) {
            form.setValue('name', category.name)
            form.setValue('slug', category.slug)
            form.setValue('description', category.description)
            form.setValue('parent', category.parent?._id || "")
            setMedia(category.media)
        }
    }, [category, form])

    const handleSlug = (e) => {
        const { value } = e.target
        const slug = value.toLowerCase().replace(/\s+/g, '-')
        form.setValue('slug', slug)
        form.setValue('name', value)
    }

    async function onSubmit(values) {
        try {
            setLoading(true)
            const response = await axios.put('/api/category/update', { ...values, media: media?._id, _id: id })
            const data = response.data
            if (data.success) {
                showToast(data.message)
                router.push('/admin/category')
            }
        } catch (error) {
            showToast(error.response.data.message || 'Error', 'error')
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    if (categoryLoading || categoriesLoading) return <Loading />

    return (
        <div className='border rounded-lg p-4'>
            <BreadCrumb breadCrumb={breadCrumb} />
            <div className='grid grid-cols-12 gap-4'>
                <div className='col-span-12 md:col-span-8'>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="eg: Saree" {...field} onChange={handleSlug} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="slug"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slug</FormLabel>
                                        <FormControl>
                                            <Input readOnly placeholder="eg: saree" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="parent"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Parent Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a parent category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="">No Parent</SelectItem>

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
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Category description" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <ButtonLoading loading={loading} type="submit">Submit</ButtonLoading>
                        </form>
                    </Form>
                </div>
                <div className='col-span-12 md:col-span-4'>
                    <div className='border rounded-lg p-4'>
                        <h2 className='text-lg font-semibold mb-4'>Category Image</h2>
                        {media && (
                            <div className='relative w-full h-48'>
                                <Image
                                    src={media.url}
                                    alt={media.alt}
                                    layout='fill'
                                    objectFit='cover'
                                    className='rounded-md'
                                />
                            </div>
                        )}
                        <MediaModal onSelectMedia={setMedia} />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditCategoryPage