import express from 'express'
const router = express.Router()
import userRoute from './user-routes'
import classRoute from './class-routes'
import verifyToken from '../middleware/verifyToken';
import qrRouter from './qr-routes'
import studentClassRouter from './studentClass-routes'
import notificationRouter from './notification-routes'
import authRouter from './auth-routes'
import orgRouter from './org-routes'

// router.use('/users', userRoute);
router.use('/auth', authRouter);

router.use(verifyToken);
router.use('/users', userRoute);
router.use('/qr', qrRouter);
router.use('/class', classRoute);
router.use('/student', studentClassRouter);
router.use('/notification', notificationRouter)
router.use('/org', orgRouter)

export default router