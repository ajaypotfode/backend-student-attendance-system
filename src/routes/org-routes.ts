import express from 'express'
// import { createOrganization, getRegistrationStatus, handleRegistration } from '../controllers/userControllers';
import adminMiddlware from '../middleware/adminMiddlware';
import { createOrganization, getOverviewData, getRegistrationStatus, handleRegistration, /*getAllOrganizations*/ } from '../controllers/orgControllers';
const router = express.Router();

router.use(adminMiddlware)
// router.get('/get', getAllOrganizations)
router.get('/overview', getOverviewData)
router.post('/handle-registration', handleRegistration);
router.post('/create-org', createOrganization);
router.get('/registration-status', getRegistrationStatus)


export default router