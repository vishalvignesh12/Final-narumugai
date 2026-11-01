'use client'

import { useState } from 'react'
import axios from 'axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { showToast } from '@/lib/showToast'

export default function EmailOtpVerification({ email, purpose = 'EMAIL_VERIFICATION', onVerified, onCancel }) {
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)

    async function verify(event) {
        event.preventDefault()
        if (loading || !/^\d{6}$/.test(otp)) return
        setLoading(true)
        try {
            const { data } = await axios.post('/api/auth/verify-otp', { email, otp, purpose })
            if (!data.success) throw new Error(data.message || 'The code could not be verified.')
            onVerified(data.data)
        } catch (error) {
            showToast('error', error.response?.data?.message || error.message)
        } finally {
            setLoading(false)
        }
    }

    async function resend() {
        try {
            const { data } = await axios.post('/api/auth/resend-otp', { email, purpose })
            if (!data.success) throw new Error(data.message || 'Could not resend the code.')
            setOtp('')
            showToast('success', data.message)
        } catch (error) {
            showToast('error', error.response?.data?.message || error.message)
        }
    }

    return (
        <form className="space-y-4" onSubmit={verify}>
            <div className="text-center">
                <h2 className="text-2xl font-bold">{purpose === 'LOGIN' ? 'Verify your sign-in' : 'Verify your email'}</h2>
                <p className="mt-2 text-sm text-muted-foreground">Enter the 6-digit code sent to {email}. The code expires in 10 minutes.</p>
            </div>
            <Input
                aria-label="Email verification code"
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={otp}
                onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className="text-center text-xl tracking-[0.5em]"
            />
            <Button className="w-full bg-pink-500 hover:bg-pink-600" type="submit" disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying…' : 'Verify code'}
            </Button>
            <div className="flex justify-center gap-4 text-sm">
                <button type="button" onClick={resend} className="text-primary underline">Resend code</button>
                {onCancel && <button type="button" onClick={onCancel} className="text-muted-foreground underline">Back</button>}
            </div>
        </form>
    )
}
