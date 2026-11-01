// store/middleware/authMiddleware.js

import { logout } from '../reducer/authReducer';

// --- 2. 'loadCartFromServer' is not in the reducer, so remove it ---
//    'clearCart' is also handled by your logout logic elsewhere, but
//    we can keep it here for safety.
import { clearCart } from '../reducer/cartReducer'; 

const authMiddleware = (storeAPI) => (next) => (action) => {
  const result = next(action);

  // Keep cart clearing tied to an explicit logout. The JWT cookie is the
  // source of truth; user details are never persisted to localStorage.
  if (action.type === logout.type) {
    storeAPI.dispatch(clearCart());
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth');
    }
  }
  
  return result;
};

export default authMiddleware;
