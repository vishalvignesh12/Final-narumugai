'use client'
import Loading from '@/components/Application/Loading'
import UserPanelLayout from '@/components/Application/Website/UserPanelLayout'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import useFetch from '@/hooks/useFetch'
import { WEBSITE_ORDER_DETAILS } from '@/routes/WebsiteRoute'
import Link from 'next/link'
import React, { useState } from 'react'
import CancelOrderDialog from '@/components/Application/Website/CancelOrderDialog'
const breadCrumbData = {
    title: 'Orders',
    links: [{ label: 'Orders' }]
}
const Orders = () => {
    const { data: orderData, loading, refetch } = useFetch("/api/user-order")
    const [refreshKey, setRefreshKey] = useState(0)

    const handleOrderCancelled = (orderId) => {
        // Refresh the orders list
        setRefreshKey(prev => prev + 1)
        refetch()
    }

    return (
        <div>
            <WebsiteBreadcrumb props={breadCrumbData} />
            <UserPanelLayout>

                <div className='shadow rounded'>
                    <div className='p-5 text-xl font-semibold border-b'>
                        Orders
                    </div>
                    <div className='p-5'>
                        {loading ?
                            <div className='text-center py-5'>Loading...</div>
                            :
                            <div className='overflow-auto'>

                                <table className='w-full'>
                                    <thead>
                                        <tr>
                                            <th className='text-start p-2 text-sm border-b text-nowrap text-gray-500'>Sr.No.</th>
                                            <th className='text-start p-2 text-sm border-b text-nowrap text-gray-500'>Order id</th>
                                            <th className='text-start p-2 text-sm border-b text-nowrap text-gray-500'>Total Item</th>
                                            <th className='text-start p-2 text-sm border-b text-nowrap text-gray-500'>Amount</th>
                                            <th className='text-start p-2 text-sm border-b text-nowrap text-gray-500'>Status</th>
                                            <th className='text-start p-2 text-sm border-b text-nowrap text-gray-500'>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>

                                        {orderData && orderData?.data?.map((order, i) => (
                                            <tr key={order._id}>
                                                <td className='text-start text-sm text-gray-500 p-2 font-bold'>{i + 1}</td>
                                                <td className='text-start text-sm text-gray-500 p-2'><Link className='underline hover:text-blue-500 underline-offset-2' href={WEBSITE_ORDER_DETAILS(order.order_id)}>{order.order_id}</Link></td>
                                                <td className='text-start text-sm text-gray-500 p-2 '>
                                                    {order.products.reduce((total, product) => total + (product.qty || 1), 0)}
                                                </td>
                                                <td className='text-start text-sm text-gray-500 p-2 '>
                                                    {order.totalAmount.toLocaleString('en-In', { style: 'currency', currency: 'INR' })}
                                                </td>
                                                <td className='text-start text-sm p-2'>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        order.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                                                        order.status === 'shipped' ? 'bg-cyan-100 text-cyan-800' :
                                                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className='text-start text-sm text-gray-500 p-2'>
                                                    <CancelOrderDialog 
                                                        order={order} 
                                                        onOrderCancelled={handleOrderCancelled}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        }

                    </div>
                </div>
            </UserPanelLayout>
        </div>
    )
}

export default Orders