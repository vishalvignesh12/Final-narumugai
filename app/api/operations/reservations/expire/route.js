import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/databaseConnection'
import { schedulerAuthorized } from '@/lib/reservationState'
import { expireStaleReservations } from '@/lib/reservationExpiry'

export async function POST(request) {
    if (!schedulerAuthorized(request.headers.get('authorization'), process.env.RESERVATION_EXPIRY_SECRET)) {
        return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'A valid scheduler token is required.' } }, { status: 401 })
    }
    try {
        await connectDB()
        return NextResponse.json({ data: await expireStaleReservations() })
    } catch (error) {
        console.error('Reservation expiry failed:', error)
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Reservation expiry failed.' } }, { status: 503 })
    }
}
