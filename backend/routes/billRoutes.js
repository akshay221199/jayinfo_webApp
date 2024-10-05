import Router from 'express';
import { createBill, getBills,updateBill,deleteBill, getBillById } from '../controllers/BillController.js';
import adminMiddleware from '../middleware/AdminMiddleware.js'
const router = Router();


router.post('/createBill',adminMiddleware,createBill);
router.get('/getBills',adminMiddleware, getBills );
router.put('/updateBill/:id', adminMiddleware,updateBill);
router.delete('/deleteBill/:id', adminMiddleware, deleteBill);
router.get('/getBillById/:id', adminMiddleware, getBillById);

export default router;