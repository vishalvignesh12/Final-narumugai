'use client'

import { useState } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { zSchema } from '@/lib/zodSchema'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { showToast } from '@/lib/showToast'
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute'

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [linkSent, setLinkSent] = useState(false)
    const form = useForm({
        resolver: zodResolver(zSchema.pick({ email: true })),
        defaultValues: { email: '' }
    })

    async function requestResetLink(values) {
        setLoading(true)
        try {
            const { data } = await axios.post('/api/auth/reset-password/send-link', values)
            if (!data.success) throw new Error(data.message || 'Could not send the reset link.')
            setLinkSent(true)
            showToast('success', data.message)
        } catch (error) {
            showToast('error', error.response?.data?.message || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="w-[400px] max-w-full">
            <CardContent className="p-6">
                <div className="mb-5 text-center">
                    <h1 className="text-3xl font-bold text-pink-500">Narumugai</h1>
                    <h2 className="mt-3 text-2xl font-bold">Reset password</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {linkSent ? 'Check your inbox for a password reset link.' : 'We’ll email you a secure link to choose a new password.'}
                    </p>
                </div>
                {!linkSent && (
                    <Form {...form}>
                        <form className="space-y-4" onSubmit={form.handleSubmit(requestResetLink)}>
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl><Input type="email" autoComplete="email" placeholder="example@gmail.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <ButtonLoading loading={loading} type="submit" text="Send reset link" className="w-full" />
                        </form>
                    </Form>
                )}
                <div className="mt-5 text-center">
                    <Link href={WEBSITE_LOGIN} className="text-primary underline">Back to sign in</Link>
                </div>
            </CardContent>
        </Card>
    )
}
