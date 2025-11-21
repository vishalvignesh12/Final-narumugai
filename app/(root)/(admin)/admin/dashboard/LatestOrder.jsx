'use client'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import useFetch from '@/hooks/useFetch'
// --- 1. FIX: Import ADMIN_ORDER_SHOW instead of ADMIN_ORDERS ---
import { ADMIN_ORDER_SHOW } from '@/routes/AdminPanelRoute'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// (These are the UI imports from our previous step)
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

dayjs.extend(relativeTime)

const LatestOrder = () => {

    // --- NO LOGIC CHANGES ---
    const [orders, setOrders] = useState([])
    const { data: orderData, loading } = useFetch('/api/dashboard/admin/latest-order')

    useEffect(() => {
        if (orderData && orderData.success) {
            setOrders(orderData.data)
        }
    }, [orderData])
    // --- END OF LOGIC ---

    // (This is the Card UI from our previous step)
    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Latest Orders</CardTitle>
                    <CardDescription>Your 5 most recent orders.</CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                    {/* --- 2. FIX: Use ADMIN_ORDER_SHOW in the href --- */}
                    <Link href={ADMIN_ORDER_SHOW} className='flex gap-2'>
                        View All
                        <ArrowRight className='h-4 w-4' />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length > 0 ? orders.map((order) => (
                            <TableRow key={order._id}>
                                <TableCell>
                                    <Link href={`/admin/orders/details/${order._id}`} className='hover:underline'>
                                        ...{order.orderId?.slice(-6)}
                                    </Link>
                                </TableCell>
                                <TableCell>{order.shippingAddress?.name || 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            order.status === 'pending' ? 'destructive' :
                                                order.status === 'processing' ? 'warning' :
                                                    order.status === 'delivered' ? 'success' :
                                                        'default'
                                        }
                                        className="capitalize"
                                    >
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{dayjs(order.createdAt).fromNow()}</TableCell>
                                <TableCell className="text-right">₹{order.totalAmount.toLocaleString('en-IN')}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan="5" className="text-center">
                                    No orders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default LatestOrder