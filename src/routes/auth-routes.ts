import express from 'express'
import { createUser, getuser, verifyAdminToken, /*studentRegistration*/ } from '../controllers/userControllers';
import { getUserStatus, loginUser, logOutUser } from '../controllers/loginControllers';
import verifyToken from '../middleware/verifyToken';
import registrationMiddlware from '../middleware/registrationMiddlware';
const router = express.Router();

router.post('/login', loginUser);
router.post('/verify-admin', verifyAdminToken)
router.post('/signup', createUser);
router.post('/register-student', registrationMiddlware, createUser)


router.post('/logout', verifyToken, logOutUser)
router.get('/status', verifyToken, getUserStatus)

export default router