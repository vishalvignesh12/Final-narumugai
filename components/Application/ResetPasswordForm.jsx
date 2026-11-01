'use client'

import { useState } from 'react'
import axios from 'axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { showToast } from '@/lib/showToast'
import { useRouter } from 'next/navigation'
import { WEBSITE_LOGIN } from '@/routes/WebsiteRoute'

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/

export default function ResetPasswordForm({ token }) {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function updatePassword(event) {
        event.preventDefault()
        if (password !== confirmPassword) {
            showToast('error', 'Passwords must match.')
            return
        }
        if (!passwordPattern.test(password)) {
            showToast('error', 'Use 8–64 characters with uppercase, lowercase, a number, and a symbol.')
            return
        }

        setLoading(true)
        try {
            const { data } = await axios.put('/api/auth/reset-password/update-password', { token, password })
            if (!data.success) throw new Error(data.message || 'Could not update the password.')
            setPassword('')
            setConfirmPassword('')
            showToast('success', data.message)
            router.push(WEBSITE_LOGIN)
        } catch (error) {
            showToast('error', error.response?.data?.message || error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <div className="text-center">
                <h1 className="text-3xl font-bold">Choose a new password</h1>
                <p className="mt-2 text-sm text-muted-foreground">Use at least 8 characters with uppercase, lowercase, a number, and a symbol.</p>
            </div>
            <form className="mt-5 space-y-4" onSubmit={updatePassword}>
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="reset-password">New password</label>
                    <Input id="reset-password" type="password" autoComplete="new-password" required maxLength={64} value={password} onChange={event => setPassword(event.target.value)} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="confirm-reset-password">Confirm password</label>
                    <Input id="confirm-reset-password" type="password" autoComplete="new-password" required maxLength={64} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} />
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                    {loading ? 'Updating…' : 'Update password'}
                </Button>
            </form>
        </div>
    )
}
