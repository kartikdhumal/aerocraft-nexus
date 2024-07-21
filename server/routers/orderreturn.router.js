import Router from 'express'
import {getReturnOrders, returnOrder} from '../controllers/orderreturn.controller.js'

const router = Router();

router.post('/returnorder',returnOrder);
router.get('/getreturnorders',getReturnOrders);

export default router;