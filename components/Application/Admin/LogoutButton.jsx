'use client'
import { useDispatch } from 'react-redux'
import { logout } from '@/store/reducer/authReducer'
import { clearCart } from '@/store/reducer/cartReducer'
import { AiOutlineLogout } from "react-icons/ai";
import axios from 'axios'
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { showToast } from '@/lib/showToast'

const LogoutButton = () => {
    const dispatch = useDispatch()

    const handleLogout = async () => {
        try {
            const { data: logoutResponse } = await axios.post('/api/auth/logout')
            if (!logoutResponse.success) {
                throw new Error(logoutResponse.message)
            }
            dispatch(logout())
            dispatch(clearCart()) // Clear the cart on logout
            showToast('success', logoutResponse.message)
        } catch (error) {
            showToast('error', error.message)
        }
    }

    return (
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
            <AiOutlineLogout color='red' />
            Logout
        </DropdownMenuItem>
    )
}

export default LogoutButton