"use client"; // <-- THIS IS THE FIX

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
import showToast from '@/lib/showToast'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { useState } from 'react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'


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
    const [date, setDate] = useState(null)


    const form = useForm({
        resolver: zodResolver(couponSchema),
        defaultValues: {
            code: "",
            discountType: "percentage",
            discountValue: 0,
            minPurchase: 0,
        },
    })

    async function onSubmit(values) {
        try {
            setLoading(true)
            const response = await axios.post('/api/coupon/create', { ...values, expiryDate: date })
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
            <BreadCrumb breadCrumb={breadCrumb} />
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Coupon Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="eg: SUMMER50" {...field} />
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
                                    <Input type="number" placeholder="eg: 50" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="minPurchase"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Min Purchase</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="eg: 500" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </FormItem>

                    <ButtonLoading loading={loading} type="submit">Submit</ButtonLoading>
                </form>
            </Form>
        </div>
    )
}

export default AddCouponPage