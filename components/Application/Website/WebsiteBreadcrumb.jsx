import { WEBSITE_HOME } from '@/routes/WebsiteRoute'
import Link from 'next/link'
import React from 'react'

const WebsiteBreadcrumb = ({ props }) => {
    return (
        <div className="lg:py-10 md:py-8 py-6 flex justify-center items-center bg-[url('/assets/images/page-title.png')] bg-cover bg-center px-4">

            <div className="max-w-4xl w-full text-center">
                <h1 className='lg:text-3xl md:text-2xl text-xl font-semibold mb-3 text-center'>{props.title}</h1>
                <ul className='flex flex-wrap gap-2 justify-center items-center text-sm md:text-base'>
                    <li><Link href={WEBSITE_HOME} className='font-semibold hover:text-primary transition-colors'>Home</Link></li>

                    {props.links.map((item, index) => (
                        <li key={index} className='flex items-center gap-2'>
                            <span className='text-gray-400'>/</span>
                            {item.href ?
                                <Link href={item.href} className='hover:text-primary transition-colors'>{item.label}</Link>
                                :
                                <span className='text-gray-600'>{item.label}</span>
                            }
                        </li>
                    ))}

                </ul>
            </div>

        </div>
    )
}

export default WebsiteBreadcrumb