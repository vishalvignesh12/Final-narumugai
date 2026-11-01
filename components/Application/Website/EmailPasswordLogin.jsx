'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { login } from '@/store/reducer/authReducer'
import { showToast } from '@/lib/showToast'
import { WEBSITE_REGISTER, WEBSITE_RESETPASSWORD, USER_DASHBOARD } from '@/routes/WebsiteRoute'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import EmailOtpVerification from '@/components/Application/EmailOtpVerification'

export default function EmailPasswordLogin({ onAuthenticated, redirectOnSuccess = true, compact = false }) {
    const dispatch = useDispatch()
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [otpRequired, setOtpRequired] = useState(false)
    const [otpPurpose, setOtpPurpose] = useState('LOGIN')

    function finishLogin(userData) {
        dispatch(login(userData))
        setPassword('')
        setOtpRequired(false)
        onAuthenticated?.(userData)
        if (redirectOnSuccess) {
            const callback = new URLSearchParams(window.location.search).get('callback')
            const safeCallback = callback?.startsWith('/') && !callback.startsWith('//') ? callback : null
            router.push(safeCallback || (userData.role === 'admin' ? ADMIN_DASHBOARD : USER_DASHBOARD))
        }
    }

    async function handleSubmit(event) {
        event.preventDefault()
        if (loading) return

        setLoading(true)
        try {
            const { data } = await axios.post('/api/auth/login', { email, password })
            if (!data.success) throw new Error(data.message || 'Unable to sign in.')
            setOtpPurpose(data.data.purpose)
            setOtpRequired(true)
            showToast('success', data.message)
        } catch (error) {
            showToast('error', error.response?.data?.message || error.message || 'Unable to sign in.')
        } finally {
            setLoading(false)
        }
    }

    async function handleOtpVerified(result) {
        if (result?.emailVerified) {
            try {
                const { data } = await axios.post('/api/auth/login', { email, password })
                if (!data.success) throw new Error(data.message || 'Could not request a sign-in code.')
                setOtpPurpose(data.data.purpose)
                showToast('success', 'Email verified. A sign-in code was sent to your email.')
            } catch (error) {
                showToast('error', error.response?.data?.message || error.message)
                setOtpRequired(false)
            }
            return
        }
        // verify-otp sets the access_token cookie before returning this user data.
        finishLogin(result)
    }

    return (
        <Card className={`w-full ${compact ? 'border-0 shadow-none' : 'max-w-md shadow-xl'}`}>
            <CardContent className={compact ? 'p-5' : 'p-6 sm:p-8'}>
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-pink-500">Narumugai</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Sign in with your email, password, and email code</p>
                </div>
                {otpRequired ? (
                    <EmailOtpVerification key={otpPurpose} email={email} purpose={otpPurpose} onVerified={handleOtpVerified} onCancel={() => setOtpRequired(false)} />
                ) : <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="login-email">Email</label>
                        <Input id="login-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium" htmlFor="login-password">Password</label>
                        <Input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} />
                    </div>
                    <Button className="w-full bg-pink-500 hover:bg-pink-600" type="submit" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign in'}
                    </Button>
                </form>}
                <div className="mt-5 flex flex-wrap justify-center gap-x-2 gap-y-1 text-sm">
                    <Link href={WEBSITE_RESETPASSWORD} className="text-primary underline">Forgot password?</Link>
                    <span aria-hidden="true">·</span>
                    <Link href={WEBSITE_REGISTER} className="text-primary underline">Create account</Link>
                </div>
            </CardContent>
        </Card>
    )
}
