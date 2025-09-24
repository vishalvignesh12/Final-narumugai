import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    count: 0,
    products: []
}

export const wishlistReducer = createSlice({
    name: 'wishlistStore',
    initialState,
    reducers: {
        addToWishlist: (state, action) => {
            const payload = action.payload
            const existingProduct = state.products.findIndex(
                (product) => product._id === payload._id
            )

            if (existingProduct < 0) {
                state.products.push(payload)
                state.count = state.products.length
            }
        },
        removeFromWishlist: (state, action) => {
            const productId = action.payload

            state.products = state.products.filter((product) => product._id !== productId)
            state.count = state.products.length
        },
        clearWishlist: (state, action) => {
            state.products = []
            state.count = 0
        },
        isInWishlist: (state, action) => {
            const productId = action.payload
            return state.products.some((product) => product._id === productId)
        }
    }
})

export const {
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist
} = wishlistReducer.actions

export default wishlistReducer.reducer