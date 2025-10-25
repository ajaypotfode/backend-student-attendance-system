import { Request, Response } from "express"
// import connectDatabse from "../utils/db"
import UserModel from "../models/userModel"
import { hash } from 'bcryptjs'
import StudentClassModel from "../models/studentClassModel"
import ClassModel from "../models/classModel"
import RegistrationModel from "../models/registrationModel"
// import { User } from "../types/userTypes"

const verifyAdminToken = (req: Request, res: Response) => {
    const { adminToken } = req.body
    const ENV_TOKEN = process.env.ADMIN_TOKEN
    if (adminToken === ENV_TOKEN) {
        return res.status(200).json({ message: "Admin Authorized", success: true, token: ENV_TOKEN })
    }
    return res.status(403).json({ message: "Access Denied, Unauthorized To Registeration", success: false })
}



const createUser = async (req: Request, res: Response): Promise<Response> => {
    const { userName, role, email, image, password, contactNo, adminToken } = req.body
    const ENV_TOKEN = process.env.ADMIN_TOKEN
    try {
        // const userRole = req.user.role
        if (role === 'admin' && adminToken !== ENV_TOKEN) {
            return res.status(403).json({ message: "Access Denied, Unauthorized To Register As Admin", success: false })
        }

        const isUser = await UserModel.findOne({
            $or: [
                { email },
                { contactNo }
            ]
        })

        if (isUser) {
            return res.status(200).json({ message: "User Is Already Created !!", success: false })
        }

        const hashedPassword = await hash(password, 10)

        const newUser = new UserModel({
            userName,
            role,
            email,
            image,
            contactNo,
            password: hashedPassword
        })

        await newUser.save();

        const result = newUser.toObject()
        result.password = ""

        return res.status(200).json({ message: "User Created SuccessFully!!", success: true, result: result })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "Failed To Create User", success: false, error: errorMessage })
    }
}



const getAllTrainer = async (req: Request, res: Response): Promise<Response> => {
    const search = req.query.search as string || ""
    const pageNum = parseInt(req.query.pageNum as string) || 1
    const limit = 15;
    try {
        const user = await UserModel.find(
            {
                role: "trainer",
                $or: [
                    { userName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            }
        )
            .skip((pageNum - 1) * limit)
            .limit(limit)
            .sort({ createdAt: 1, _id: 1 })
            .select('-password')


        const totalTrainers = await UserModel.countDocuments({ role: 'trainer' })

        const pages = {
            totalPages: Math.ceil(totalTrainers / limit),
            pageNum: Math.ceil(totalTrainers / limit) === 0 ? 0 : pageNum
        }

        return res.status(200).json({ message: "Trainer Fetched SuccesFully!!", success: true, result: user, pages })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "failed To Fetch Trainer", success: false, error: errorMessage })
    }
}


// this is use to get Active Trainers
const getActiveTrainers = async (req: Request, res: Response): Promise<Response> => {
    const { search } = req.query

    try {
        const user = await UserModel.find(
            {
                role: "trainer",
                status: 'active',
                $or: [
                    { userName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]

            }
        ).select('-password')

        // const result = {
        //     user
        // }

        return res.status(200).json({ message: "Trainer Fetched SuccesFully!!", success: true, result: user })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "failed To Fetch Trainer", success: false, error: errorMessage })
    }
}



const getSingleTrainer = async (req: Request, res: Response): Promise<Response> => {
    const trainerId = req.params.id;
    try {
        const trainer = await UserModel.findOne({ role: 'trainer', _id: trainerId }).select('-password');

        const trainerClass = await ClassModel.find({ trainer: trainerId }).select('className time')

        const trainerObject = trainer?.toObject();
        const result = {
            ...trainerObject,
            trainerClass
        }

        return res.status(200).json({ message: "Trainer Fetched SuccesFully!!", success: true, result: result })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "failed To Fetch Trainer", success: false, error: errorMessage })
    }
}




const getStudents = async (req: Request, res: Response): Promise<Response> => {
    const search = req.query.search as string || ""
    const pageNum = parseInt(req.query.pageNum as string) || 1
    const limit = 15;

    try {
        const user = await UserModel.find({
            role: 'student',
            $or: [
                { email: { $regex: search, $options: 'i' } }, // meaning of $options: 'i' is to case insensetive
                { userName: { $regex: search, $options: 'i' } }
            ]
        })
            .skip((pageNum - 1) * limit)
            .limit(limit)
            .sort({ createdAt: 1, _id: 1 })
            .select('-password')


        const totalStudents = await UserModel.countDocuments({ role: 'student' })

        const pages = {
            totalPages: Math.ceil(totalStudents / limit),
            pageNum: Math.ceil(totalStudents / limit) === 0 ? 0 : pageNum
        }
        return res.status(200).json({ message: "student Fetched SuccesFully!!", success: true, result: user, pages })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "failed To Fetch Student", success: false, error: errorMessage })
    }
}




const getSingleStudent = async (req: Request, res: Response): Promise<Response> => {
    // const studentId = req.params.id
    const { studentId, email } = req.query
        ;
    try {
        const student = await UserModel.findOne({
            role: 'student',
            $or: [
                { _id: studentId },
                { email: email }
            ]
        }).select('-password')

        if (!student) {
            return res.status(200).json({ message: "Student Data Not Found !!", success: false })
        }

        const studentClass = await StudentClassModel.find({ studentId: student?._id })
            .populate('classId', 'className time')
            .select('-_id -studentId')

        const studentObject = student.toObject()
        const result = {
            ...studentObject,
            studentClass
        }


        return res.status(200).json({ message: "student Fetched SuccesFully!!", success: true, result: result })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "failed To Fetch Student", success: false, error: errorMessage })
    }
}




const getuser = async (req: Request, res: Response): Promise<Response> => {
    const { userName, email } = req.query

    try {

        const users = await UserModel.findOne({
            $or: [
                { userName },
                { email }
            ]
        }).select('-password')

        if (!users) {
            return res.status(404).json({ message: "user Not Found!!", success: false })
        }

        return res.status(200).json({ message: "users Fetched SuccesFully!!", success: true, result: users })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "failed To Fetch users", success: false, error: errorMessage })
    }
}


// Make User Active Or Block
const manageUserStatus = async (req: Request, res: Response): Promise<Response> => {
    const { email, userName, status } = req.body

    try {
        const user = await UserModel.findOne({ email, userName, status })

        if (user) {
            return res.status(200).json({ message: `User Is Already ${status}!!`, success: false });
        }

        const UpdatedUser = await UserModel.findOneAndUpdate(
            { userName, email },
            { status },
            { new: true }
        ).select('-password')


        return res.status(200).json({ message: "User Status Changed SuccessFully!!", success: true, result: UpdatedUser })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "failed To change Status", success: false, error: errorMessage })
    }
}



export {
    verifyAdminToken,
    createUser,
    getAllTrainer,
    getuser,
    getStudents,
    getActiveTrainers,
    getSingleStudent,
    getSingleTrainer,
    manageUserStatus,
    // createOrganization,
    // handleRegistration,
    // studentRegistration,
    // getRegistrationStatus
}