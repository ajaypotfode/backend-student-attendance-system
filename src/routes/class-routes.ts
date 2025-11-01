import express from 'express'
import { addClass, getActiveClasses, getClasses, getClassReference,getTodaysClassAttendence, markCompleteClass, weeklyClassAttendence } from '../controllers/classControllers'
import adminMiddlware from '../middleware/adminMiddlware';
const router = express.Router()

router.use(adminMiddlware)
router.get('/get', getClasses);
router.get('/get-reference', getClassReference);
router.get('/active-class', getActiveClasses);
router.post('/add-class', addClass);
router.post('/mark-complete', markCompleteClass)
// router.get('/overview', getOverviewData);
router.get('/todays-attendence', getTodaysClassAttendence);
router.get('/weekly-attendence', weeklyClassAttendence)

export default router
