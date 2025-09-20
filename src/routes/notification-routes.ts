import express from 'express'
// import { addNotification, deleteNotification, getNotification } from '../controllers/notificationController.ts'
import adminMiddlware from '../middleware/adminMiddlware';
import { addNotification, deleteNotification, getNotification } from '../controllers/notificationController';
const router = express.Router()

router.get('/get', getNotification);
router.use(adminMiddlware)
router.delete('/delete', deleteNotification);
router.post('/add', addNotification)


export default router