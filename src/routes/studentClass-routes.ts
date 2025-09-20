import express from 'express'
import { addStudentClass, getStudentsAttendenceSummary, getStudentClasses, getStudentAttendence, getAvailableStudents, getStudentsActiveClasses } from '../controllers/studentClassControllers'
import adminMiddlware from '../middleware/adminMiddlware';
const router = express.Router()

// for student-Management
router.get('/get-classes', getStudentClasses);
router.get('/active-classes', getStudentsActiveClasses)
// this api Is Not In Used change after some time if it is not getting use
router.get('/class-Attendence', getStudentAttendence)

router.get('/attendence-summary', getStudentsAttendenceSummary)
router.use(adminMiddlware)
router.get('/available-students', getAvailableStudents)
router.post('/add-class', addStudentClass);

export default router