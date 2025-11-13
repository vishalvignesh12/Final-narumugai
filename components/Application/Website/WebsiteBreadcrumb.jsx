"use client"
import { WEBSITE_HOME } from '@/routes/WebsiteRoute'
import Link from 'next/link'
import React from 'react'
import { Slash } from "lucide-react"

const WebsiteBreadcrumb = (props) => {
    return (
        <section className='bg-secondary-subtle/20 py-8 px-4'>
            <div className="max-w-4xl w-full text-center">
                {/* This line is from our previous fix, it's correct */}
                {props.title && <h1 className='lg:text-3xl md:text-2xl text-xl font-semibold mb-3 text-center'>{props.title}</h1>}
                
                <ul className='flex flex-wrap gap-2 justify-center items-center text-sm md:text-base'>
                    <li><Link href={WEBSITE_HOME} className='font-semibold hover:text-primary transition-colors'>Home</Link></li>
                    {
                        props.items.map((item, index) => {
                            const isLastItem = props.items.length - 1 === index;
                            return (
                                <li key={index} className='flex items-center gap-2'>
                                    <Slash size={16} className='text-muted-foreground' />
                                    
                                    {/* --- THIS IS THE FIX --- */}
                                    {/* If it's the last item, render text. Otherwise, render a link. */}
                                    {isLastItem ? (
                                        <span className="text-primary font-semibold">
                                            {item.title}
                                        </span>
                                    ) : (
                                        <Link 
                                            href={item.href} 
                                            className="font-semibold hover:text-primary transition-colors"
                                        >
                                            {item.title}
                                        </Link>
                                    )}
                                    {/* --- END OF FIX --- */}

                                </li>
                            )
                        })
                    }
                </ul>
            </div>
        </section>
    )
}

export default WebsiteBreadcrumb