import UserPanelLayout from '@/components/Application/Website/UserPanelLayout'
import ProfileUpdateForm from '@/components/Application/Website/ProfileUpdateForm'
import ChangePasswordForm from '@/components/Application/Website/ChangePasswordForm'

const breadCrumb = [
    {
        label: 'Home',
        link: '/'
    },
    {
        label: 'My Account',
        link: '/my-account'
    },
    {
        label: 'Profile'
    }
]

const ProfilePage = () => {
    return (
        <UserPanelLayout title="My Profile" breadCrumb={breadCrumb}>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <div className='lg:col-span-1'>
                    <ProfileUpdateForm />
                </div>
                <div className='lg:col-span-1'>
                    <ChangePasswordForm />
                </div>
            </div>
        </UserPanelLayout>
    )
}

export default ProfilePage