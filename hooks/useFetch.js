'use client'
import axios from "axios"
import { useEffect, useMemo, useState } from "react"

const useFetch = (url, method = "GET", options = {}) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [refreshIndex, setRefreshIndex] = useState(0)

    // Memoize options to prevent unnecessary re-renders
    const optionsString = JSON.stringify(options)
    const requestOptions = useMemo(() => {
        try {
            const opts = { ...options }
            if (method === 'POST' && !opts.data) {
                opts.data = {}
            }
            return opts
        } catch (err) {
            console.error('Error parsing options:', err)
            return {}
        }
    }, [method, optionsString])

    useEffect(() => {
        const apiCall = async () => {
            if (!url) return
            
            setLoading(true)
            setError(null)
            try {
                const { data: response } = await axios({
                    url,
                    method,
                    ...requestOptions
                })

                if (!response?.success) {
                    throw new Error(response?.message || 'Request failed')
                }

                setData(response)
            } catch (error) {
                setError(error?.message || 'An error occurred')
                console.error('useFetch error:', error)
            } finally {
                setLoading(false)
            }
        }

        apiCall()

    }, [url, method, refreshIndex, requestOptions])

    const refetch = () => {
        setRefreshIndex(prev => prev + 1)
    }

    return { data, loading, error, refetch }
}

export default useFetch