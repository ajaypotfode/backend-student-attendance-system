import { Request, Response } from "express"
import RegistrationModel from "../models/registrationModel"
import { parse } from "date-fns"
import UserModel from "../models/userModel"
import ClassModel from "../models/classModel"

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



const getOverviewData = async (req: Request, res: Response): Promise<Response> => {

    try {
        //   const 
        // const totalStudent = await UserModel.countDocuments({ role: 'student' });
        // const activeStudent = await UserModel.countDocuments({ role: 'student', status: 'active' });
        // const totalClass = await ClassModel.countDocuments();
        // const activeClass = await ClassModel.countDocuments({ status: 'active' })

        // countDocuments() is use To total Number Of Documents In mongoose Collection
        const [totalStudent, activeStudent, totalClass, activeClass] = await Promise.all([
            UserModel.countDocuments({ role: 'student' }),
            UserModel.countDocuments({ role: 'student', status: 'active' }),
            ClassModel.countDocuments(),
            ClassModel.countDocuments({ status: 'active' })
        ])


        const result = [
            { count: totalStudent, title: "Total Students", details: "Total Students In Our Organization", logoData: 'students' },
            { count: activeStudent, title: "Active Students", details: "Active Students In Our Organization", logoData: 'activeStudents' },
            { count: totalClass, title: "Total Classes", details: "Batches Did by Our Organization", logoData: 'classes' },
            { count: activeClass, title: "Active Classes", details: "Active Batches In Our Organization", logoData: 'activeClass' }
        ]
        //     totalStudent,
        //     activeStudent,
        //     totalClass,
        //     activeClass
        // }

        return res.status(200).json({ message: "Data Fetched Success!!", success: true, result: result })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sometimg Went Wrong"
        return res.status(500).json({ message: "failed To Fetch Data For Overview!!", success: false, error: errorMessage })
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
    getOverviewData,
    // getAllOrganizations,
    // studentRegistration,
    getRegistrationStatus
}