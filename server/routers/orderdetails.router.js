import Router from 'express'
import {getOrderDetail} from '../controllers/orderdetail.controller.js'

const router = Router();
router.get('/orderdetails',getOrderDetail);


export default router;