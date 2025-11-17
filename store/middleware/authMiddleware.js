// store/middleware/authMiddleware.js

// --- 1. Import 'login' from the authReducer ---
import { login, logout } from '../reducer/authReducer'; 

// --- 2. 'loadCartFromServer' is not in the reducer, so remove it ---
//    'clearCart' is also handled by your logout logic elsewhere, but
//    we can keep it here for safety.
import { clearCart } from '../reducer/cartReducer'; 

const authMiddleware = (storeAPI) => (next) => (action) => {
  const result = next(action);

  // --- 3. Check for the 'login' action ---
  if (action.type === login.type) {
    // Save the user data to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth', JSON.stringify(action.payload));
    }
  }

  // --- 4. Check for the 'logout' action ---
  if (action.type === logout.type) {
    // Clear the cart when user logs out
    storeAPI.dispatch(clearCart());
    // Also remove the auth data from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth');
    }
  }
  
  return result;
};

export default authMiddleware;