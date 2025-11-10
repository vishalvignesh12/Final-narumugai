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
            // --- FIX: Recalculate count properly when setting new cart data ---
            state.count = state.products.reduce((total, product) => total + (product.qty || 1), 0);
        },
        addIntoCart: (state, action) => {
            const payload = action.payload
            const existingProductIndex = state.products.findIndex( // --- Renamed to 'existingProductIndex'
                (product) => product.productId === payload.productId && product.variantId === payload.variantId
            )
            
            const qtyToAdd = payload.qty || 1; // Get quantity to add

            if (existingProductIndex < 0) {
                state.products.push({ ...payload, qty: qtyToAdd })
            } else {
                // If product already exists, increase quantity
                state.products[existingProductIndex].qty += qtyToAdd
            }
            
            // --- FIX: Efficiently update count ---
            state.count += qtyToAdd;
        },
        increaseQuantity: (state, action) => {
            const { productId, variantId } = action.payload
            const existingProductIndex = state.products.findIndex(
                (product) => product.productId === productId && product.variantId === variantId
            )

            if (existingProductIndex >= 0) {
                state.products[existingProductIndex].qty += 1
                // --- FIX: Efficiently update count ---
                state.count += 1;
            }
        },
        decreaseQuantity: (state, action) => {
            const { productId, variantId } = action.payload
            const existingProductIndex = state.products.findIndex(
                (product) => product.productId === productId && product.variantId === variantId
            )

            if (existingProductIndex >= 0) {
                if (state.products[existingProductIndex].qty > 1) {
                    state.products[existingProductIndex].qty -= 1
                    // --- FIX: Efficiently update count ---
                    state.count -= 1;
                }
            }
        },
        removeFromCart: (state, action) => {
            const { productId, variantId } = action.payload

            // --- FIX: Find item to get its quantity before removing ---
            const existingProductIndex = state.products.findIndex(
                (product) => product.productId === productId && product.variantId === variantId
            )

            if (existingProductIndex >= 0) {
                const qtyToRemove = state.products[existingProductIndex].qty || 1;
                
                // Remove the product from array
                state.products.splice(existingProductIndex, 1);
                
                // --- FIX: Efficiently update count ---
                state.count -= qtyToRemove;
            }
        },
        updateCartItemQuantity: (state, action) => {
            const { productId, variantId, qty } = action.payload
            const existingProductIndex = state.products.findIndex(
                (product) => product.productId === productId && product.variantId === variantId
            )
            
            if (existingProductIndex < 0) return; // Product not found

            const newQty = Math.max(0, qty); // Ensure quantity is not negative
            const oldQty = state.products[existingProductIndex].qty || 1;
            const qtyDifference = newQty - oldQty;

            if (newQty === 0) {
                // Remove item if quantity is 0
                state.products.splice(existingProductIndex, 1)
            } else {
                // Update quantity
                state.products[existingProductIndex].qty = newQty
            }
            
            // --- FIX: Efficiently update count ---
            state.count += qtyDifference;
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