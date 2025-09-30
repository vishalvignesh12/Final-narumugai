// store/middleware/authMiddleware.js
import { logout } from '../reducer/authReducer';
import { clearCart, loadCartFromServer } from '../reducer/cartReducer';

const authMiddleware = (storeAPI) => (next) => (action) => {
  const result = next(action);

  // Check if logout action was dispatched
  if (action.type === logout.type) {
    // Clear the cart when user logs out
    storeAPI.dispatch(clearCart());
  }
  
  return result;
};

export default authMiddleware;