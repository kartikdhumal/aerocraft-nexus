import Router from 'express'
import {addModels, deleteModelByID, getModelByID, getModels, getModelsByCategoryName, updateModelByID} from '../controllers/model.controller.js'

const router = Router();

router.post('/addmodel',addModels);
router.put('/updatemodel/:id',updateModelByID);
router.delete('/deletemodel/:id',deleteModelByID);
router.get('/models',getModels);
router.get('/getmodel/:id',getModelByID);
router.get('/modelsbycat/:categoryName',getModelsByCategoryName);


export default router;