'use client'

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadCartFromServer } from '@/lib/cartAPI';

const CartProvider = ({ children }) => {
  const dispatch = useDispatch();
  const auth = useSelector(store => store.authStore.auth);

  useEffect(() => {
    // Load cart when auth state changes
    if (auth) {
      // User logged in, load their cart from server
      loadCartFromServer(dispatch);
    } else {
      // User logged out, clear local cart
      // This will be handled by the auth logout action
    }
  }, [auth, dispatch]);

  return children;
};

export default CartProvider;