import Router from 'express'
import { addtoCart, cartItemCountByID, deleteCartByID, getCartByuserId, getCarts, updateCartItemQuantity } from '../controllers/cart.controller.js'

const router = Router();
router.post('addtoCart', addtoCart);
router.get('/cartitemcount/:id', cartItemCountByID);
router.get('/carts', getCarts);
router.get('/getcart/:userId', getCartByuserId);
router.put('/updateCartItemQuantity', updateCartItemQuantity);
router.delete('/deletecart/:id', deleteCartByID);


export default router;