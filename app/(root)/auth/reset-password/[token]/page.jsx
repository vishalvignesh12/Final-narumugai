'use client'

import { use } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import ResetPasswordForm from '@/components/Application/ResetPasswordForm'

export default function UpdatePasswordPage({ params }) {
    const { token } = use(params)
    return (
        <Card className="w-[440px] max-w-full">
            <CardContent className="p-6">
                <div className="mb-5 text-center">
                    <h1 className="text-3xl font-bold text-pink-500">Narumugai</h1>
                </div>
                <ResetPasswordForm token={token} />
            </CardContent>
        </Card>
    )
}
