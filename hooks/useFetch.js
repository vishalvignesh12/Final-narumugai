import { useState, useEffect } from 'react'
import axios from 'axios'
import { showToast } from '@/lib/showToast'

const useFetch = (url) => {
    //                                    THIS IS THE FIX
    //                                        ||
    //                                        \/
    const [data, setData] = useState([]) // Initialize with an empty array
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(undefined)

    const refetch = async () => {
        setLoading(true)
        try {
            const { data: response } = await axios.get(url)
            if (!response.success) {
                throw new Error(response.message)
            }
            setData(response.data)
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