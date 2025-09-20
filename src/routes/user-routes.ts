// /users
import express from 'express'
import { getActiveTrainers, getSingleStudent, getSingleTrainer, getStudents, getAllTrainer, manageUserStatus, getuser} from '../controllers/userControllers';
// import { getUserStatus, logOutUser } from '../controllers/loginControllers';
// import verifyToken from '../middleware/verifyToken';
import adminMiddlware from '../middleware/adminMiddlware';
const router = express.Router();

// router.post('/login', loginUser);
// router.post('/add', createUser);

// // this is used only for trial
// router.get('/get-users', getuser)
// router.get('/get-student', getStudents)

// router.use(verifyToken)
router.use(adminMiddlware)
// router.post('/create-org', createOrganization)
// router.post('/handle-registration', handleRegistration)
router.get('/get-user', getuser)
router.get('/all-student', getStudents)
router.get('/get-student', getSingleStudent)
router.get('/all-trainer', getAllTrainer);
router.get('/get-tariner/:id', getSingleTrainer)
router.get('/active-trainers', getActiveTrainers);
router.post('/change-status', manageUserStatus)

export default router