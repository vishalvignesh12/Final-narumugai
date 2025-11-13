'use client'
import { store } from '@/store/store'
import React, { useEffect, useState } from 'react' // Import useState
import { Provider, useDispatch, useSelector } from 'react-redux'
import 'react-toastify/dist/ReactToastify.css';
import { login } from '@/store/reducer/authReducer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // 1. Import React Query

/**
 * This component is responsible for re-hydrating the auth state
 * from localStorage when the application loads on the client.
 */
const AuthHydrator = ({ children }) => {
    const dispatch = useDispatch();
    const auth = useSelector(store => store.authStore.auth);

    useEffect(() => {
        if (!auth) {
            const persistedAuth = localStorage.getItem('auth');
            if (persistedAuth) {
                try {
                    const authData = JSON.parse(persistedAuth);
                    if (authData) {
                        dispatch(login(authData));
                    }
                } catch (error) {
                    console.error("Failed to parse auth from localStorage", error);
                    localStorage.removeItem('auth');
                }
            }
        }
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
                <AuthHydrator>
                    {children}
                </AuthHydrator>
            </QueryClientProvider>
        </Provider>
    )
}

export default GlobalProvider