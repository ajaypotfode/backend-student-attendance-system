import { Request, Response, NextFunction } from 'express'
// import connectDatabse from '../utils/db'
import RegistrationModel from '../models/registrationModel';

const registrationMiddlware = async (req: Request, res: Response, next: NextFunction) => {

    const orgName = process.env.ORGNAME

    const org = await RegistrationModel.findOne({ orgName })
    if (org) {
        const expiry = org.registrationExpires && new Date() > org.registrationExpires
        if (!org.registrationOpen || expiry) {
            return res.status(401).json({ message: "Registration Closed!!", success: false })

        }
    }
    next()
}

export default registrationMiddlware