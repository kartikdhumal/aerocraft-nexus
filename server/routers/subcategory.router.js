import Router from 'express'
import {addSubcategory, deleteSubcategoryByID, findCategoryBySubcategory, getSubcategories, getSubcategoryByID, UpdateSubcategoryByID} from '../controllers/subcategory.controller.js'

const router = Router();
router.post('/addsubcategory',addSubcategory);
router.put('/updatesubcategory/:id',UpdateSubcategoryByID);
router.delete('/deletesubcategory/:id',deleteSubcategoryByID);
router.get('/subcategories',getSubcategories);
router.get('/getsubcategory/:id',getSubcategoryByID);
router.get('/findcatbysub/:id',findCategoryBySubcategory);

export default router;