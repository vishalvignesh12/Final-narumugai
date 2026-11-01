import { Suspense } from 'react'
import EmailPasswordLogin from '@/components/Application/Website/EmailPasswordLogin'

export const metadata = {
    title: 'Sign in | Narumugai',
    description: 'Sign in to Narumugai with your email and password.'
}

export default function LoginPage() {
    return (
        <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading sign in…</p>}>
            <EmailPasswordLogin />
        </Suspense>
    )
}
