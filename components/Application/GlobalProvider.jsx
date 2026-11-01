'use client'
import { store } from '@/store/store'
import React, { useEffect, useState } from 'react' // Import useState
import { Provider, useDispatch, useSelector } from 'react-redux'
import 'react-toastify/dist/ReactToastify.css';
import { clearAuth, login } from '@/store/reducer/authReducer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // 1. Import React Query
import axios from 'axios'

const AuthHydrator = ({ children }) => {
    const dispatch = useDispatch();
    const auth = useSelector(store => store.authStore.auth);

    useEffect(() => {
        try {
            localStorage.removeItem('auth');
        } catch {
            // Storage may be unavailable; the cookie session still works.
        }
        const handleAuthExpired = () => dispatch(clearAuth());
        window.addEventListener('auth-expired', handleAuthExpired);
        const interceptorId = axios.interceptors.response.use(
            response => response,
            (error) => {
                if (error.response?.status === 401) dispatch(clearAuth());
                return Promise.reject(error);
            },
        );
        if (auth) {
            return () => {
                window.removeEventListener('auth-expired', handleAuthExpired);
                axios.interceptors.response.eject(interceptorId);
            };
        }

        let active = true;
        axios.get('/api/auth/session')
            .then(({ data }) => {
                if (active && data.success && data.data) dispatch(login(data.data));
            })
            .catch((error) => {
                if (active && error.response?.status === 401) dispatch(clearAuth());
            });

        return () => {
            active = false;
            window.removeEventListener('auth-expired', handleAuthExpired);
            axios.interceptors.response.eject(interceptorId);
        };
    }, [dispatch, auth]);

    return <>{children}</>;
}

const GlobalProvider = ({ children }) => {
    // 2. Create a new QueryClient instance
    //    We use useState to ensure it's only created once per component lifecycle
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                refetchOnWindowFocus: false, // Optional: disable refetch on focus
            },
        },
    }));

    return (
        <Provider store={store}>
            {/* 3. Wrap everything with the QueryClientProvider */}
            <QueryClientProvider client={queryClient}>
                {/* AuthHydrator will now restore the auth state on load */}
                <AuthHydrator>
                    {children}
                </AuthHydrator>
            </QueryClientProvider>
        </Provider>
    )
}

export default GlobalProvider
