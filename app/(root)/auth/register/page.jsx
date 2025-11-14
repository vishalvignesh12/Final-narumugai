'use client'
import { Card, CardContent } from '@/components/ui/card'
import React, { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { zSchema } from '@/lib/zodSchema'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from 'react-hook-form'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { z } from 'zod'
import { FaRegEyeSlash } from "react-icons/fa";
import { FaRegEye } from "react-icons/fa6";
import Link from 'next/link'
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
// import OTPVerification from '@/components/Application/OTPVerification' // <-- OLD LINE REMOVED
import dynamic from 'next/dynamic' // <-- 1. IMPORT DYNAMIC

// 2. THIS IS THE NEW DYNAMIC IMPORT BLOCK
const OTPVerification = dynamic(
  () => import('@/components/Application/OTPVerification'),
  { 
    ssr: false, // <-- This is the fix
    loading: () => <p>Loading OTP...</p> // Optional placeholder
  }
)

const RegisterPage = () => {

    const [loading, setLoading] = useState(false)
    const [otpVerificationLoading, setOtpVerificationLoading] = useState(false)
    const [isTypePassword, setIsTypePassword] = useState(true)
    const [otpEmail, setOtpEmail] = useState()

    const formSchema = zSchema.pick({
        name: true,
        email: true,
        mobile: true
    }).extend({
        password: z.string().min(8, 'Password must be 8 character.')
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            mobile: "",
            password: "",
        },
    })

    const handleRegisterSubmit = async (values) => {
        try {
            setLoading(true)
            const { data: registerResponse } = await axios.post('/api/auth/register', values)
            if (!registerResponse.success) {
                throw new Error(registerResponse.message)
            }
            setOtpEmail(values.email)
            form.reset()
            showToast('success', registerResponse.message)
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setLoading(false)
        }
    }


    // otp verification  
    const handleOtpVerification = async (values) => {
        try {
            setOtpVerificationLoading(true)
            const { data: otpResponse } = await axios.post('/api/auth/verify-otp', values)
            if (!otpResponse.success) {
                throw new Error(otpResponse.message)
            }
            setOtpEmail('')
            showToast('success', otpResponse.message)
        } catch (error) {
            showToast('error', error.message)
        } finally {
            setOtpVerificationLoading(false)
        }
    }

    return (
        <Card className="w-[400px]">
            <CardContent>
                <div className='flex justify-center'>
                    <h1 className='text-4xl font-bold text-pink-500 mb-3'>Narumugai</h1>
                </div>

                {!otpEmail
                    ?
                    <>
                        <div className='text-center'>
                            <h1 className='text-3xl font-bold mb-3'>Create An Account</h1>
                        </div>
                        <div className='mt-5'>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(handleRegisterSubmit)} >
                                    <div className='mb-5'>
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input type="text" placeholder="Enter your name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className='mb-5'>
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="example@gmail.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className='mb-5'>
                                        <FormField
                                            control={form.control}
                                            name="mobile"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mobile</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="Enter your mobile" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className='mb-5'>
                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="relative">
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input type={isTypePassword ? 'password' : 'text'} placeholder="***********" {...field} />
                                                    </FormControl>
                                                    <button className='absolute top-1/2 right-2 cursor-pointer' type='button' onClick={() => setIsTypePassword(!isTypePassword)}>
                                                        {isTypePassword ?
                                                            <FaRegEyeSlash />
                                                            :
                                                            <FaRegEye />
                                                        }
                                                    </button>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <div className='mb-3'>
                                        <ButtonLoading loading={loading} type="submit" text="Register" className="w-full cursor-pointer" />
                                    </div>
                                    <div className='text-center'>
                                        <div className='flex justify-center items-center gap-1'>
                                            <p>Already have account?</p>
                                            <Link href={WEBSITE_LOGIN} className='text-primary underline'>Login now!</Link>
                                        </div>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </>
                    :
                    <OTPVerification email={otpEmail} onSubmit={handleOtpVerification} loading={otpVerificationLoading} />
                }


            </CardContent>
        </Card>
    )
}

export default RegisterPage