import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { combineReducers } from 'redux'

import authReducer from './reducer/authReducer'
import cartReducer from './reducer/cartReducer'
import wishlistReducer from './reducer/wishlistReducer'
import authMiddleware from './middleware/authMiddleware'

const persistConfig = {
    key: 'root',
    version: 1,
    storage,
    whitelist: ['cartStore', 'wishlistStore'] // Persist cart and wishlist
}

const reducers = combineReducers({
    authStore: authReducer,
    cartStore: cartReducer,
    wishlistStore: wishlistReducer,
})

const persistedReducer = persistReducer(persistConfig, reducers)

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }).concat(authMiddleware),
})

export const persistor = persistStore(store)