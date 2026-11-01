'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { usePathname } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import EmailPasswordLogin from '@/components/Application/Website/EmailPasswordLogin'

function VisuallyHidden({ children }) {
    return <span className="sr-only">{children}</span>
}

const TRIGGER_CONDITIONS = {
    TIME_THRESHOLD: 300_000,
    PAGE_THRESHOLD: 5,
    INTERACTION_THRESHOLD: 10,
}

export default function LoginModal() {
    const pathname = usePathname()
    const auth = useSelector(store => store.authStore.auth)
    const [isOpen, setIsOpen] = useState(false)
    const [hasShownModal, setHasShownModal] = useState(false)
    const [pageVisits, setPageVisits] = useState(0)
    const [browsingTime, setBrowsingTime] = useState(0)

    useEffect(() => {
        if (auth || hasShownModal) return undefined
        const timer = setInterval(() => setBrowsingTime(time => time + 1_000), 1_000)
        return () => clearInterval(timer)
    }, [auth, hasShownModal])

    useEffect(() => {
        if (!auth && !hasShownModal) setPageVisits(visits => visits + 1)
    }, [pathname, auth, hasShownModal])

    useEffect(() => {
        if (auth || hasShownModal) return undefined
        let interactionCount = 0
        const handleInteraction = () => {
            interactionCount += 1
            if (interactionCount >= TRIGGER_CONDITIONS.INTERACTION_THRESHOLD) {
                setIsOpen(true)
                setHasShownModal(true)
            }
        }
        window.addEventListener('scroll', handleInteraction, { passive: true })
        window.addEventListener('click', handleInteraction)
        window.addEventListener('mousemove', handleInteraction)
        return () => {
            window.removeEventListener('scroll', handleInteraction)
            window.removeEventListener('click', handleInteraction)
            window.removeEventListener('mousemove', handleInteraction)
        }
    }, [auth, hasShownModal])

    useEffect(() => {
        if (!auth && !hasShownModal && !isOpen &&
            (browsingTime >= TRIGGER_CONDITIONS.TIME_THRESHOLD || pageVisits >= TRIGGER_CONDITIONS.PAGE_THRESHOLD)) {
            setIsOpen(true)
            setHasShownModal(true)
        }
    }, [auth, hasShownModal, isOpen, browsingTime, pageVisits])

    useEffect(() => {
        if (auth) {
            setIsOpen(false)
            return
        }
        setHasShownModal(false)
        setBrowsingTime(0)
        setPageVisits(0)
    }, [auth])

    const handleAuthenticated = useCallback(() => setIsOpen(false), [])
    const handleClose = open => {
        setIsOpen(open)
        if (!open) setTimeout(() => setHasShownModal(false), 300_000)
    }

    if (auth) return null

    return (
        <Dialog open={isOpen} onOpenChange={handleClose} modal>
            <DialogContent className="max-w-md border-none bg-transparent p-0 shadow-2xl">
                <VisuallyHidden>
                    <DialogTitle>Sign in with email and password</DialogTitle>
                    <DialogDescription>Sign in to your Narumugai account.</DialogDescription>
                </VisuallyHidden>
                <EmailPasswordLogin onAuthenticated={handleAuthenticated} redirectOnSuccess={false} compact />
            </DialogContent>
        </Dialog>
    )
}
