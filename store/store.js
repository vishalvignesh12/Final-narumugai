import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import { combineReducers } from 'redux'

import authReducer from './reducer/authReducer'
import cartReducer from './reducer/cartReducer'
import wishlistReducer from './reducer/wishlistReducer'
import authMiddleware from './middleware/authMiddleware'

// Create a storage solution that works server-side
const storage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        return Promise.resolve(window.localStorage.getItem(key));
      }
      return Promise.resolve(null);
    } catch (error) {
      return Promise.resolve(null);
    }
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.setItem(key, value);
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.resolve();
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
        window.localStorage.removeItem(key);
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.resolve();
    }
  },
};

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