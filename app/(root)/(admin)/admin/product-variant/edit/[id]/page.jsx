'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import MediaModal from '@/components/Application/Admin/MediaModal'
import Select from '@/components/Application/Select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { sizes } from '@/lib/utils'
import { zSchema } from '@/lib/zodSchema'
import { ADMIN_DASHBOARD, ADMIN_PRODUCT_VARIANT_SHOW } from '@/routes/AdminPanelRoute'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import Image from 'next/image'
import { use, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { showToast } from '@/lib/showToast'
import useFetch from '@/hooks/useFetch'

const EditProductVariant = ({ params }) => {
    const { id } = use(params)
    const [loading, setLoading] = useState(false)
    const [productOption, setProductOption] = useState([])
    const [open, setOpen] = useState(false)
    const [selectedMedia, setSelectedMedia] = useState([])
    const { data: getProduct } = useFetch('/api/product?deleteType=SD&&size=10000')
    const { data: getVariant, loading: getVariantLoading } = useFetch(`/api/product-variant/get/${id}`)

    useEffect(() => {
        if (getProduct?.success) {
            setProductOption(getProduct.data.map(product => ({ label: product.name, value: product._id })))
        }
    }, [getProduct])

    const formSchema = zSchema.pick({
        _id: true, product: true, sku: true, color: true, size: true,
        mrp: true, sellingPrice: true, discountPercentage: true
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            _id: id, product: '', sku: '', color: '', size: '',
            mrp: '', sellingPrice: '', discountPercentage: ''
        }
    })

    useEffect(() => {
        if (getVariant?.success) {
            const variant = getVariant.data
            form.reset({
                _id: variant._id,
                product: variant.product?._id || variant.product,
                sku: variant.sku || '',
                color: variant.color || '',
                size: variant.size || '',
                mrp: variant.mrp || '',
                sellingPrice: variant.sellingPrice || '',
                discountPercentage: variant.discountPercentage || ''
            })
            setSelectedMedia((variant.media || []).map(media => ({
                _id: media._id,
                url: media.secure_url
            })))
        }
    }, [getVariant, form])

    const onSubmit = async values => {
        if (selectedMedia.length === 0) {
            showToast('error', 'Please select media.')
            return
        }
        setLoading(true)
        try {
            const { data: response } = await axios.put('/api/product-variant/update', {
                ...values,
                media: selectedMedia.map(media => media._id)
            })
            if (!response.success) throw new Error(response.message)
            showToast('success', response.message)
        } catch (error) {
            showToast('error', error.response?.data?.message || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={[
                { href: ADMIN_DASHBOARD, label: 'Home' },
                { href: ADMIN_PRODUCT_VARIANT_SHOW, label: 'Product Variants' },
                { href: '', label: 'Edit Product Variant' }
            ]} />
            <Card className="py-0 rounded shadow-sm">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <h4 className="text-xl font-semibold">Edit Product Variant</h4>
                </CardHeader>
                <CardContent className="pb-5">
                    {getVariantLoading ? <p>Loading product variant...</p> : (
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="grid md:grid-cols-2 grid-cols-1 gap-5">
                                    <FormField control={form.control} name="product" render={({ field }) => (
                                        <FormItem><FormLabel>Product *</FormLabel><FormControl>
                                            <Select options={productOption} selected={field.value} setSelected={field.onChange} isMulti={false} />
                                        </FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="sku" render={({ field }) => (
                                        <FormItem><FormLabel>SKU *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="color" render={({ field }) => (
                                        <FormItem><FormLabel>Color *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="size" render={({ field }) => (
                                        <FormItem><FormLabel>Size *</FormLabel><FormControl>
                                            <Select options={sizes} selected={field.value} setSelected={field.onChange} isMulti={false} />
                                        </FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="mrp" render={({ field }) => (
                                        <FormItem><FormLabel>MRP *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="sellingPrice" render={({ field }) => (
                                        <FormItem><FormLabel>Selling Price *</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="discountPercentage" render={({ field }) => (
                                        <FormItem><FormLabel>Discount Percentage *</FormLabel><FormControl><Input type="number" readOnly {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <div className="mt-5 border border-dashed rounded p-5 text-center">
                                    <MediaModal open={open} setOpen={setOpen} selectedMedia={selectedMedia} setSelectedMedia={setSelectedMedia} isMultiple />
                                    {selectedMedia.length > 0 && <div className="flex justify-center flex-wrap mb-3 gap-2">
                                        {selectedMedia.map(media => <Image key={media._id} src={media.url} height={100} width={100} alt="" className="size-24 object-cover border" />)}
                                    </div>}
                                    <Button type="button" variant="outline" onClick={() => setOpen(true)}>Select Media</Button>
                                </div>
                                <div className="mt-5">
                                    <ButtonLoading loading={loading} type="submit" text="Update Product Variant" />
                                </div>
                            </form>
                        </Form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default EditProductVariant
