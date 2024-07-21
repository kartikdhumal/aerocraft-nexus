import Router from 'express'
import {addOrder, deleteOrderByID, getOrderByuserID, getOrders, getOrdersAll, updateStatusByID} from '../controllers/order.controller.js'

const router = Router();
router.get('/orders',getOrders);
router.post('/addorder',addOrder);
router.get('/orders/:userId',getOrderByuserID);
router.get('/getorders',getOrdersAll);
router.put('/updatestatus/:id',updateStatusByID);
router.delete('/deleteorder/:id',deleteOrderByID);

export default router;