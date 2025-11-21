import { useState, useEffect } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'

const useFetch = (url) => {
    // Keeping [] is fine for lists, though 'null' is often safer for object checks.
    // If lists crash without [], keep it as [].
    const [data, setData] = useState([]) 
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(undefined)

    const refetch = async () => {
        setLoading(true)
        try {
            // 'response' here IS the actual JSON body ({ success: true, data: ... })
            const { data: response } = await axios.get(url)
            
            if (!response.success) {
                throw new Error(response.message)
            }
            
            // FIX: Pass the WHOLE response object, not just response.data
            // This ensures 'data.success' exists for your components checks.
            setData(response) 
            
        } catch (error) {
            setError(error.message)
            showToast('error', error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        refetch()
    }, [url])

    return { data, loading, error, refetch }
}

export default useFetch