import { Request, Response } from "express"
import RegistrationModel from "../models/registrationModel"
import { parse } from "date-fns"

const createOrganization = async (req: Request, res: Response): Promise<Response> => {
    // const { orgName } = req.body
    try {
        const orgName = process.env.ORGNAME

        const isOrg = await RegistrationModel.findOne({ orgName })

        if (isOrg) {
            return res.status(200).json({ message: "Already organization Registerd!! ", success: false })

        }

        const organization = new RegistrationModel({
            orgName,
            registrationExpires: null,
            registrationOpen: false
        })

        organization.save()

        return res.status(200).json({ message: "organization Register!! ", success: true })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "Failed To Create Organozation", success: false, error: errorMessage })

    }
}



// const getAllOrganizations = async (req: Request, res: Response): Promise<Response> => {
//     try {
//         const registration = await RegistrationModel.find();
//         return res.status(200).json({ message: "Organazations Fetched Success!!", success: true, result: registration })
//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
//         return res.status(500).json({ message: "Failed To Fetch Organazations", success: false, error: errorMessage })

//     }
// }



const handleRegistration = async (req: Request, res: Response): Promise<Response> => {
    const { date, time, registration } = req.body
    // console.log("date is :", date)

    const combineDate = `${date} ${time}`

    const dateStr = parse(combineDate, 'yyyy-MM-dd HH:mm', new Date())

    // const
    const orgName = process.env.ORGNAME

    try {
        const updated = await RegistrationModel.findOneAndUpdate(
            { orgName },
            { registrationExpires: dateStr, registrationOpen: registration },
            { new: true, upsert: true }
        )

        // if (!updated) {
        //     return res.status(200).json({ message: "failed To registration!!", success: false })
        // }

        return res.status(200).json({ message: `Registration ${registration ? 'open' : 'closed'}!!`, success: true, result: updated })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: `Failed To ${registration ? 'open' : 'closed'}`, success: false, error: errorMessage })

    }
}



const getRegistrationStatus = async (req: Request, res: Response): Promise<Response> => {
    // const { orgName } = req.params
    const orgName = process.env.ORGNAME
    try {
        const registration = await RegistrationModel.findOne({ orgName });
        return res.status(200).json({ message: "Registration Status Fetched Success!!", success: true, result: registration })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "Failed To Fetch Registration Status", success: false, error: errorMessage })

    }
}


export {
    createOrganization,
    handleRegistration,
    // getAllOrganizations,
    // studentRegistration,
    getRegistrationStatus
}