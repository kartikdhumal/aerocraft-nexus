import Router from 'express'
import {addCompany, deleteCompanyByID, getCompanies, getCompanyByID, updateCompanyByID} from '../controllers/company.controller.js'

const router = Router();

router.post('/addcompany',addCompany);
router.put('/updatecompany/:id',updateCompanyByID);
router.delete('/deletecompany/:id',deleteCompanyByID);
router.get('/companies',getCompanies);
router.get('/getcompany/:id',getCompanyByID);


export default router;