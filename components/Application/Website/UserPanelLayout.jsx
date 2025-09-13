import React from 'react'
import UserPanelNavigation from './UserPanelNavigation'

const UserPanelLayout = ({ children }) => {
    return (
        <div className='lg:flex lg:flex-nowrap flex-col lg:gap-8 gap-6 lg:px-32 md:px-8 px-4 lg:my-20 md:my-16 my-10'>
            <div className='lg:w-64 w-full flex-shrink-0 lg:mb-0 mb-6'>
                <div className='lg:sticky lg:top-4'>
                    <UserPanelNavigation />
                </div>
            </div>
            <div className='flex-1 min-w-0'>
                {children}
            </div>
        </div>
    )
}

export default UserPanelLayout