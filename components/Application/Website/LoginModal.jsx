'use client'
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
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
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa6"
import Link from 'next/link'
import { USER_DASHBOARD, WEBSITE_REGISTER, WEBSITE_RESETPASSWORD } from '@/routes/WebsiteRoute'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import OTPVerification from '@/components/Application/OTPVerification'
import { useDispatch, useSelector } from 'react-redux'
import { login } from '@/store/reducer/authReducer'
import { useRouter, usePathname } from 'next/navigation'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'

// Simple VisuallyHidden component for accessibility
const VisuallyHidden = ({ children }) => (
    <span className="sr-only">{children}</span>
)

const LoginModal = () => {
    const dispatch = useDispatch()
    const router = useRouter()
    const pathname = usePathname()
    const auth = useSelector(store => store.authStore.auth)
    
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [otpVerificationLoading, setOtpVerificationLoading] = useState(false)
    const [isTypePassword, setIsTypePassword] = useState(true)
    const [otpEmail, setOtpEmail] = useState()
    const [pageVisits, setPageVisits] = useState(0)
    const [browsingTime, setBrowsingTime] = useState(0)
    const [hasShownModal, setHasShownModal] = useState(false)

    // Constants for triggering the modal
    const TRIGGER_CONDITIONS = {
        TIME_THRESHOLD: 300000, // 5 minutes of browsing (increased from 2 minutes)
        PAGE_THRESHOLD: 5, // After visiting 5 pages (increased from 3)
        INTERACTION_THRESHOLD: 10 // After 10 interactions (increased from 5)
    }

    // Track browsing time
    useEffect(() => {
        if (!auth && !hasShownModal) {
            const timer = setInterval(() => {
                setBrowsingTime(prev => prev + 1000)
            }, 1000)

            return () => clearInterval(timer)
        }
    }, [auth, hasShownModal])

    // Track page visits
    useEffect(() => {
        if (!auth && !hasShownModal) {
            setPageVisits(prev => prev + 1)
        }
    }, [pathname, auth, hasShownModal])

    // Track user interactions
    useEffect(() => {
        if (!auth && !hasShownModal) {
            let interactionCount = 0

            const handleInteraction = () => {
                interactionCount++
                if (interactionCount >= TRIGGER_CONDITIONS.INTERACTION_THRESHOLD) {
                    setIsOpen(true)
                    setHasShownModal(true)
                }
            }

            // Add event listeners for various interactions
            window.addEventListener('scroll', handleInteraction, { passive: true })
            window.addEventListener('click', handleInteraction)
            window.addEventListener('mousemove', handleInteraction)

            return () => {
                window.removeEventListener('scroll', handleInteraction)
                window.removeEventListener('click', handleInteraction)
                window.removeEventListener('mousemove', handleInteraction)
            }
        }
    }, [auth, hasShownModal])

    // Check if modal should be shown based on conditions
    useEffect(() => {
        if (!auth && !hasShownModal && !isOpen) {
            const shouldShowModal = 
                browsingTime >= TRIGGER_CONDITIONS.TIME_THRESHOLD ||
                pageVisits >= TRIGGER_CONDITIONS.PAGE_THRESHOLD

            if (shouldShowModal) {
                setIsOpen(true)
                setHasShownModal(true)
            }
        }
    }, [browsingTime, pageVisits, auth, hasShownModal, isOpen])

    // Reset state when user logs out
    useEffect(() => {
        if (!auth) {
            setHasShownModal(false)
            setBrowsingTime(0)
            setPageVisits(0)
        } else {
            setIsOpen(false)
        }
    }, [auth])

    const formSchema = zSchema.pick({
        email: true
    }).extend({
        password: z.string().min('3', 'Password field is required.')
    })

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const handleLoginSubmit = async (values) => {
        try {
            setLoading(true)
            const { data: loginResponse } = await axios.post('/api/auth/login', values)
            if (!loginResponse.success) {
                throw new Error(loginResponse.message)
            }

            setOtpEmail(values.email)
            form.reset()
            showToast('success', loginResponse.message)
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

            dispatch(login(otpResponse.data))
            setIsOpen(false) // Close modal on successful login

            // Redirect based on role
            if (otpResponse.data.role === 'admin') {
                router.push(ADMIN_DASHBOARD)
            } else {
                router.push(USER_DASHBOARD)
            }

        } catch (error) {
            showToast('error', error.message)
        } finally {
            setOtpVerificationLoading(false)
        }
    }

    const handleCloseModal = () => {
        setIsOpen(false)
        // Allow user to continue browsing but they'll see the modal again after more interaction
        setTimeout(() => {
            setHasShownModal(false)
        }, 300000) // Reset after 5 minutes
    }

    // Don't render modal if user is authenticated
    if (auth) {
        return null
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleCloseModal} modal={true}>
            <DialogContent 
                className="max-w-md p-0 gap-0 bg-transparent border-none shadow-2xl"
            >
                {/* Add DialogTitle for accessibility - visually hidden */}
                <VisuallyHidden>
                    <DialogTitle>
                        {!otpEmail ? "Login to Narumugai" : "Email Verification"}
                    </DialogTitle>
                </VisuallyHidden>

                <Card className="w-full border-2 border-pink-100 shadow-2xl">
                    <CardContent className="p-6">
                        <div className='flex justify-center mb-6'>
                            <h1 className='text-4xl font-bold text-pink-500'>Narumugai</h1>
                        </div>

                        {!otpEmail ? (
                            <>
                                <div className='text-center mb-6'>
                                    <h2 className='text-2xl font-bold mb-2'>Join Our Community!</h2>
                                    <p className='text-gray-600 text-sm'>Sign in to unlock exclusive deals and save your favorites</p>
                                </div>

                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(handleLoginSubmit)} className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                            type="email" 
                                                            placeholder="example@gmail.com" 
                                                            className="h-11"
                                                            {...field} 
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem className="relative">
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <div className="relative">
                                                            <Input 
                                                                type={isTypePassword ? 'password' : 'text'} 
                                                                placeholder="***********" 
                                                                className="h-11 pr-10"
                                                                {...field} 
                                                            />
                                                            <button 
                                                                className='absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700' 
                                                                type='button' 
                                                                onClick={() => setIsTypePassword(!isTypePassword)}
                                                            >
                                                                {isTypePassword ? <FaRegEyeSlash /> : <FaRegEye />}
                                                            </button>
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <ButtonLoading 
                                            loading={loading} 
                                            type="submit" 
                                            text="Sign In" 
                                            className="w-full h-11 bg-pink-500 hover:bg-pink-600 cursor-pointer" 
                                        />

                                        <div className='text-center space-y-3'>
                                            <div className='flex justify-center items-center gap-1 text-sm'>
                                                <p className="text-gray-600">Don't have an account?</p>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        handleCloseModal()
                                                        setTimeout(() => {
                                                            window.location.href = WEBSITE_REGISTER
                                                        }, 100)
                                                    }}
                                                    className='text-pink-500 hover:text-pink-600 font-medium underline bg-transparent border-none cursor-pointer'
                                                >
                                                    Sign up
                                                </button>
                                            </div>
                                            <div>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        handleCloseModal()
                                                        setTimeout(() => {
                                                            window.location.href = WEBSITE_RESETPASSWORD
                                                        }, 100)
                                                    }}
                                                    className='text-pink-500 hover:text-pink-600 text-sm font-medium underline bg-transparent border-none cursor-pointer'
                                                >
                                                    Forgot password?
                                                </button>
                                            </div>
                                            <div className='pt-2'>
                                                <button 
                                                    type="button"
                                                    onClick={handleCloseModal}
                                                    className='text-gray-500 hover:text-gray-700 text-sm underline bg-transparent border-none cursor-pointer'
                                                >
                                                    Continue browsing
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                </Form>
                            </>
                        ) : (
                            <div>
                                <div className='text-center mb-6'>
                                    <h2 className='text-2xl font-bold mb-2'>Verify Your Email</h2>
                                    <p className='text-gray-600 text-sm'>We've sent a verification code to your email</p>
                                </div>
                                <OTPVerification 
                                    email={otpEmail} 
                                    onSubmit={handleOtpVerification} 
                                    loading={otpVerificationLoading} 
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    )
}

export default LoginModal