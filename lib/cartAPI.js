// lib/cartAPI.js
import { setCart, setCartLoading, setCartError, clearCart as clearCartAction } from '@/store/reducer/cartReducer';
import { showToast } from './showToast';
import axios from 'axios';

const CART_API_BASE = '/api/cart';

/**
 * Thunk action to fetch the user's cart from the server.
 */
export const fetchCart = () => async (dispatch) => {
    dispatch(setCartLoading(true));
    try {
        const { data } = await axios.get(CART_API_BASE);
        if (data.success) {
            dispatch(setCart(data.cart)); // Use setCart
        } else {
            throw new Error(data.message || 'Failed to fetch cart');
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch cart';
        dispatch(setCartError(errorMessage));
        // Don't show toast on initial fetch, it might be annoying
    }
};

/**
 * Thunk action to update the user's cart on the server.
 */
export const updateCart = (cartData) => async (dispatch) => {
    dispatch(setCartLoading(true));
    try {
        const { data } = await axios.post(CART_API_BASE, cartData);
        if (data.success) {
            dispatch(setCart(data.cart)); // Use setCart
            showToast('success', 'Cart updated successfully');
        } else {
            throw new Error(data.message || 'Failed to update cart');
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to update cart';
        dispatch(setCartError(errorMessage));
        showToast('error', errorMessage);
    }
};

/**
 * Thunk action to clear the user's cart on the server.
 */
export const clearCartAPI = () => async (dispatch) => {
    dispatch(setCartLoading(true));
    try {
        const { data } = await axios.delete(CART_API_BASE);
        if (data.success) {
            dispatch(clearCartAction()); // Dispatch the local clear action
            showToast('success', 'Cart cleared');
        } else {
            throw new Error(data.message || 'Failed to clear cart');
        }
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message || 'Failed to clear cart';
        dispatch(setCartError(errorMessage));
        showToast('error', errorMessage);
    }
};