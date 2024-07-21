import Router from 'express'
import {addCategory, deleteCategoryByID, getCategories, getCategoryByID, updateCategoryByID} from '../controllers/category.controller.js'

const router = Router();

router.post('/addcategory',addCategory);
router.put('/updatecategory/:id',updateCategoryByID);
router.delete('/deletecategory/:id',deleteCategoryByID);
router.get('/categories',getCategories);
router.get('/getcategory/:id',getCategoryByID);

export default router;