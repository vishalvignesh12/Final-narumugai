'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useFetch from '@/hooks/useFetch'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { IoStar } from 'react-icons/io5'

// --- UI CHANGES: Import Card components ---
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

dayjs.extend(relativeTime)

const LatestReview = () => {

    // --- NO LOGIC CHANGES ---
    const [reviews, setReviews] = useState([])
    const { data: reviewData, loading } = useFetch('/api/dashboard/admin/latest-review')

    useEffect(() => {
        if (reviewData && reviewData.success) {
            setReviews(reviewData.data)
        }
    }, [reviewData])
    // --- END OF LOGIC ---

    // --- UI CHANGES: Wrap component in <Card> ---
    return (
        <Card>
            <CardHeader>
                <CardTitle>Latest Reviews</CardTitle>
                <CardDescription>Your most recent customer reviews.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className='space-y-6'>
                    {reviews.length > 0 ? reviews.map((review) => (
                        <div key={review._id} className="flex gap-4">
                            <Avatar className='h-10 w-10'>
                                <AvatarImage src={review.user?.image} alt={review.user?.name} />
                                <AvatarFallback>{review.user?.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className='flex-1'>
                                <div className='flex justify-between items-center'>
                                    <h4 className='font-semibold'>{review.user?.name}</h4>
                                    <span className='text-xs text-gray-500'>{dayjs(review.createdAt).fromNow()}</span>
                                </div>
                                <div className='flex items-center gap-1 mt-1'>
                                    {Array.from({ length: review.rating }).map((_, i) => (
                                        <IoStar key={i} className='text-yellow-500' />
                                    ))}
                                    {Array.from({ length: 5 - review.rating }).map((_, i) => (
                                        <IoStar key={i} className='text-gray-300' />
                                    ))}
                                </div>
                                <p className='text-sm text-gray-600 mt-2'>{review.review}</p>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center text-gray-500 py-4">
                            No reviews found.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default LatestReview