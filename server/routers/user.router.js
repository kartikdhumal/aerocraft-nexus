import Router from 'express'
import { addUser, deleteUser, getUserByEmail, getUserByID, getUsers, loginUser, RegisterUser, updatePassword, updateProfileByID } from '../controllers/user.controller.js'

const router = Router();

router.post('/register', RegisterUser);
router.post('/login', loginUser);
router.put('/updatepassword',updatePassword);
router.get('/users',getUsers);
router.post('/adduser',addUser);
router.get('/getuser/:email',getUserByEmail);
router.get('/getuserbyid/:id',getUserByID);
router.delete('/deleteuser/:id',deleteUser);
router.put('/updateprofile/:id',updateProfileByID);

export default router;