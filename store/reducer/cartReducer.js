import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    count: 0,
    products: [],
    loading: false,
    error: null
}

export const cartReducer = createSlice({
    name: 'cartStore',
    initialState,
    reducers: {
        setCartLoading: (state, action) => {
            state.loading = action.payload;
        },
        setCartError: (state, action) => {
            state.error = action.payload;
        },
        setCartData: (state, action) => {
            state.products = action.payload.products || [];
            state.count = action.payload.count || 0;
        },
        addIntoCart: (state, action) => {
            const payload = action.payload
            const existingProduct = state.products.findIndex(
                (product) => product.productId === payload.productId && product.variantId === payload.variantId
            )

            if (existingProduct < 0) {
                state.products.push({ ...payload, qty: payload.qty || 1 })
            } else {
                // If product already exists, increase quantity
                state.products[existingProduct].qty += (payload.qty || 1)
            }
            // Calculate total count as sum of all quantities
            state.count = state.products.reduce((total, product) => total + (product.qty || 1), 0)
        },
        increaseQuantity: (state, action) => {
            const { productId, variantId } = action.payload
            const existingProduct = state.products.findIndex(
                (product) => product.productId === productId && product.variantId === variantId
            )

            if (existingProduct >= 0) {
                state.products[existingProduct].qty += 1
                // Recalculate total count
                state.count = state.products.reduce((total, product) => total + (product.qty || 1), 0)
            }
        },
        decreaseQuantity: (state, action) => {
            const { productId, variantId } = action.payload
            const existingProduct = state.products.findIndex(
                (product) => product.productId === productId && product.variantId === variantId
            )

            if (existingProduct >= 0) {
                if (state.products[existingProduct].qty > 1) {
                    state.products[existingProduct].qty -= 1
                    // Recalculate total count
                    state.count = state.products.reduce((total, product) => total + (product.qty || 1), 0)
                }
            }
        },
        removeFromCart: (state, action) => {
            const { productId, variantId } = action.payload

            state.products = state.products.filter((product) => !(product.productId === productId && product.variantId === variantId))
            // Recalculate total count after removal
            state.count = state.products.reduce((total, product) => total + (product.qty || 1), 0)
        },
        updateCartItemQuantity: (state, action) => {
            const { productId, variantId, qty } = action.payload
            const existingProduct = state.products.findIndex(
                (product) => product.productId === productId && product.variantId === variantId
            )

            if (existingProduct >= 0 && qty > 0) {
                state.products[existingProduct].qty = qty
            } else if (existingProduct >= 0 && qty <= 0) {
                // Remove item if quantity is 0 or less
                state.products.splice(existingProduct, 1)
            }
            // Recalculate total count after update
            state.count = state.products.reduce((total, product) => total + (product.qty || 1), 0)
        },
        clearCart: (state, action) => {
            state.products = []
            state.count = 0
        }

    }
})

export const {
    setCartLoading,
    setCartError,
    setCartData,
    addIntoCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    updateCartItemQuantity,
    clearCart
} = cartReducer.actions
export default cartReducer.reducer
