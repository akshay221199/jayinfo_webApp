import {registerAdmin, loginAdmin, getAdmin, updateAdmin, deleteAdmin} from '../controllers/AdminController.js'
import adminMiddleware from '../middleware/AdminMiddleware.js'
import { Router } from "express";
const router = Router()


router.post("/adminForm",registerAdmin);
router.post('/loginAdmin',loginAdmin);
router.get('/adminDetails', adminMiddleware, getAdmin);
router.put('/updateAdmin/:id', adminMiddleware, updateAdmin);
router.delete('/deleteAdmin/:id', adminMiddleware, deleteAdmin);


export default router;