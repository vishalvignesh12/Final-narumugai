import { createSlice } from "@reduxjs/toolkit"

// Helper function to safely parse from localStorage
const getInitialState = () => {
    let cart = {
        products: [],
        count: 0
    };
    try {
        // This logic is good, but redux-persist makes it slightly redundant
        // It's still safe to keep as a fallback.
        if (typeof window !== 'undefined') {
            const persistedCart = localStorage.getItem('cart');
            if (persistedCart) {
                const parsed = JSON.parse(persistedCart);
                // Basic validation
                if (parsed && Array.isArray(parsed.products) && typeof parsed.count === 'number') {
                    cart = parsed;
                }
            }
        }
    } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
    }
    
    // Return the full initial state including API states
    return {
        ...cart,
        loading: false,
        error: null,
    }
}

const initialState = getInitialState();

export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // --- Actions to handle API state (Excellent for production) ---
        setCart: (state, action) => {
            const cartData = action.payload;
            state.products = cartData.products;
            state.count = cartData.count;
            state.loading = false;
            state.error = null;
        },
        setCartLoading: (state, action) => {
            state.loading = action.payload;
        },
        setCartError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },

        // --- Client-side actions ---
        addProduct: (state, action) => {
            const newItem = action.payload;
            
            // Check if the item with the specific variantId already exists
            const existingItem = state.products.find(
                (item) => item.variantId === newItem.variantId
            );

            if (existingItem) {
                // If it exists, just increase the quantity
                existingItem.qty += (newItem.qty || 1);
            } else {
                // If it doesn't exist, add it to the cart
                state.products.push({ ...newItem, qty: newItem.qty || 1 });
                state.count += 1; // Only increment count for *new* items
            }
        },
        removeProduct: (state, action) => {
            const variantIdToRemove = action.payload;
            
            state.products = state.products.filter(
                (item) => item.variantId !== variantIdToRemove
            );
            state.count = state.products.length; // Recalculate count
        },
        updateProductQty: (state, action) => {
            const { variantId, qty } = action.payload;
            const itemToUpdate = state.products.find(
                (item) => item.variantId === variantId
            );

            if (itemToUpdate) {
                itemToUpdate.qty = qty;
            }
        },
        clearCart: (state) => {
            state.products = [];
            state.count = 0;
            // Also clear error/loading
            state.loading = false;
            state.error = null;
        }
    }
})

// Export all actions
export const { 
    setCart,
    setCartLoading,
    setCartError,
    addProduct, 
    removeProduct, 
    updateProductQty, 
    clearCart 
} = cartSlice.actions

export default cartSlice.reducer