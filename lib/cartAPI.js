// lib/cartAPI.js
import { setCartData, setCartLoading, setCartError } from '@/store/reducer/cartReducer';
import { showToast } from './showToast';

const CART_API_BASE = '/api/cart';

export const loadCartFromServer = async (dispatch) => {
  try {
    dispatch(setCartLoading(true));
    
    const response = await fetch(CART_API_BASE, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (result.success) {
      dispatch(setCartData(result.data));
    } else {
      dispatch(setCartError(result.message));
      console.error('Failed to load cart:', result.message);
    }
  } catch (error) {
    console.error('Error loading cart:', error);
    dispatch(setCartError(error.message));
    showToast('error', 'Failed to load cart');
  } finally {
    dispatch(setCartLoading(false));
  }
};

export const addItemToCart = async (dispatch, itemData) => {
  try {
    dispatch(setCartLoading(true));
    
    const response = await fetch(CART_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });

    const result = await response.json();

    if (result.success) {
      // Refresh cart data from server
      await loadCartFromServer(dispatch);
      showToast('success', 'Product added to cart');
    } else {
      dispatch(setCartError(result.message));
      showToast('error', result.message);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    dispatch(setCartError(error.message));
    showToast('error', 'Failed to add product to cart');
  } finally {
    dispatch(setCartLoading(false));
  }
};

export const updateCartItem = async (dispatch, itemData) => {
  try {
    dispatch(setCartLoading(true));
    
    const response = await fetch(CART_API_BASE, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(itemData),
    });

    const result = await response.json();

    if (result.success) {
      // Refresh cart data from server
      await loadCartFromServer(dispatch);
    } else {
      dispatch(setCartError(result.message));
      showToast('error', result.message);
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    dispatch(setCartError(error.message));
    showToast('error', 'Failed to update cart');
  } finally {
    dispatch(setCartLoading(false));
  }
};

export const removeCartItem = async (dispatch, variantId) => {
  try {
    dispatch(setCartLoading(true));
    
    const response = await fetch(CART_API_BASE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ variantId }),
    });

    const result = await response.json();

    if (result.success) {
      // Refresh cart data from server
      await loadCartFromServer(dispatch);
      showToast('success', 'Product removed from cart');
    } else {
      dispatch(setCartError(result.message));
      showToast('error', result.message);
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    dispatch(setCartError(error.message));
    showToast('error', 'Failed to remove product from cart');
  } finally {
    dispatch(setCartLoading(false));
  }
};