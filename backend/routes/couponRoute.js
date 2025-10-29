import express from 'express';
import { 
    createCoupon, 
    listCoupons, 
    getCoupon, 
    validateCoupon, 
    applyCoupon, 
    updateCoupon, 
    deleteCoupon,
    getActiveCoupons 
} from '../controllers/couponController.js';
import adminAuth from '../middlewares/adminAuth.js';
import authUser from '../middlewares/auth.js';

const couponRouter = express.Router();

// Rotas para Admin
couponRouter.post('/create', adminAuth, createCoupon);
couponRouter.get('/list', adminAuth, listCoupons);
couponRouter.get('/get/:couponId', adminAuth, getCoupon);
couponRouter.put('/update/:couponId', adminAuth, updateCoupon);
couponRouter.delete('/delete/:couponId', adminAuth, deleteCoupon);

// Rotas para usuários
couponRouter.post('/validate', authUser, validateCoupon);
couponRouter.post('/apply', authUser, applyCoupon);
couponRouter.get('/active', getActiveCoupons);

export default couponRouter;