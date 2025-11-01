import { Response, Request } from "express"
import ClassModel from "../models/classModel";
import UserModel from "../models/userModel";
import ClassAttendenceModel from "../models/ClassAttendenceModel";
import { format } from 'date-fns'

const addClass = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { className, trainer, time } = req.body;

        const isClass = await ClassModel.findOne({ className, trainer, time })

        if (isClass) {
            return res.status(200).json({ message: "Class Already Allotted to This Trainer ", success: false })
        }

        const newClass = new ClassModel({
            className,
            trainer,
            time
        })

        await newClass.save()

        const result = await newClass.populate('trainer', 'userName')

        return res.status(200).json({ message: "Class Is Created SuccessFully!!", success: true, result: result })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sometimg Went Wrong"

        return res.status(500).json({ message: "failed To Create Class!!", success: false, error: errorMessage })
    }
}



const getClasses = async (req: Request, res: Response): Promise<Response> => {

    const search = req.query.search as string || "";
    const pageNum = parseInt(req.query.pageNum as string) || 1
    const limit = 15;
    try {
        const classes = await ClassModel.find({
            className: { $regex: search, $options: 'i' }
        })
            .populate('trainer', 'userName')
            .skip((pageNum - 1) * limit)
            .limit(limit)
            .sort({ createdAt: 1, _id: 1 })

        // const pages={

        // }
        const totalClass = await ClassModel.countDocuments();

        const pages = {
            totalPages: Math.ceil(totalClass / limit),
            pageNum: Math.ceil(totalClass / limit) === 0 ? 0 : pageNum
        }

        return res.status(200).json({ message: "Classes Fetched Successfully", success: true, result: classes, pages })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sometimg Went Wrong"
        return res.status(500).json({ message: "failed To Fetch Class!!", success: false, error: errorMessage })
    }
}



const getClassReference = async (req: Request, res: Response): Promise<Response> => {

    const search = req.query.search as string || "";
    // const pageNum = parseInt(req.query.pageNum as string) || 1
    const limit = 15;
    try {
        const classes = await ClassModel.find({
            className: { $regex: search, $options: 'i' }
        })
            .populate('trainer', 'userName')
            // .skip((pageNum - 1) * limit)
            .limit(limit)
            .sort({ createdAt: 1 })

        return res.status(200).json({ message: "Classes Fetched Successfully", success: true, result: classes })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sometimg Went Wrong"
        return res.status(500).json({ message: "failed To Fetch Class!!", success: false, error: errorMessage })
    }
}




const markCompleteClass = async (req: Request, res: Response): Promise<Response> => {
    const { classId } = req.body;
    try {
        const updateClass = await ClassModel.findByIdAndUpdate(
            classId,
            { status: 'complete' },
            { new: true }
        ).populate('trainer', 'userName')

        // if (!updateClass) {
        //     return res.status(200).json({ message: "Class Already Marked As Complete!!", success: false })
        // }

        return res.status(200).json({ message: "Class Marked As Complete!!", success: true, return: updateClass })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sometimg Went Wrong"
        return res.status(500).json({ message: "failed To marked As Complete!", success: false, error: errorMessage })
    }

}



const getActiveClasses = async (req: Request, res: Response): Promise<Response> => {
    const search = req.query.search as string || "";

    try {
        const classes = await ClassModel.find({
            status: 'active',
            className: { $regex: search, $options: 'i' }
            // $or: [
            //     { className: { $regex: search, $options: 'i' } },
            //     { trainer: { $regex: search, $options: 'i' } }
            // ]
        }).populate('trainer', 'userName')

        return res.status(200).json({ message: "Classes Fetched Successfully", success: true, result: classes })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sometimg Went Wrong"
        return res.status(500).json({ message: "failed To Fetch Class!!", success: false, error: errorMessage })
    }
}






// this is use To Get Todays Class Attendence Data
const getTodaysClassAttendence = async (req: Request, res: Response): Promise<Response> => {
    const classId = req.query.classId

    if (!classId) {
        return res.status(200).json({ message: "classId Missing!!", success: false })
    }
    ;

    try {
        const currentDate = format(new Date(), 'yyyy-MM-dd')
        const classAttendence = await ClassAttendenceModel.findOne({ date: currentDate, classId })
            .populate('classId', 'className time')
        // const classAttendence = await ClassAttendenceModel.find()

        return res.status(200).json({ message: "Todays Attendence Summary Fetched Success!!", success: true, result: classAttendence })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sometimg Went Wrong"
        return res.status(500).json({ message: "failed To Fetch Attendence Summary !!", success: false, error: errorMessage })
    }
}



// this use To get weekly Class Attendence summary
const weeklyClassAttendence = async (req: Request, res: Response): Promise<Response> => {
    const { startDate, endDate, classId } = req.query

    // expecting startDate and end date into yyyy-MM-dd format ;
    try {


        if (!classId) {
            return res.status(200).json({ message: "Plaese Mention ClassId!!", success: false })
        }

        if (!endDate || !startDate) {
            return res.status(200).json({ message: "Plaese Mention Date Range!!", success: false })
        }

        const classAttendence = await ClassAttendenceModel.find({
            classId
            , date: { $gte: startDate, $lte: endDate } //"gte" means Greate Than Equal To And "lte" means Less than Equal to 
        })



        return res.status(200).json({ message: "Weakly Attendence Summary Fetched Success!!", success: true, result: classAttendence })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sometimg Went Wrong"
        return res.status(500).json({ message: "failed To Fetch Attendence Summary!!", success: false, error: errorMessage })
    }
}


export { addClass, getClasses, getTodaysClassAttendence, weeklyClassAttendence, getActiveClasses, markCompleteClass, getClassReference }