// ./qr-routes

import express from 'express'
import { classStudentAttendence, closeClass, generateQrCode, verifyQr } from '../controllers/qrCodeControllers'
import adminMiddlware from '../middleware/adminMiddlware'
const router = express.Router()

router.post('/generate-qr', generateQrCode)

router.use(adminMiddlware)
router.post('/close-class', closeClass)
router.post('/verify-qr', verifyQr)
router.post('/add-summary', classStudentAttendence)

export default router