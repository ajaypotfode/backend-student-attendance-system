import { Response, Request } from "express"
import ClassModel from "../models/classModel";
import ClassAttendenceModel from "../models/ClassAttendenceModel";
import { format, parse, subDays } from 'date-fns'
import SummaryModel from "../models/AttendenceSummaryModel";
import { generatingClassQuery } from "../helpers/classQuery";

const addClass = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { className, trainer, time } = req.body;

        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
            return res.status(400).json({ message: "Invalid time format. Use HH:mm", success: false });
        }

        const query = generatingClassQuery(trainer, time)
        const isClass = await ClassModel.findOne(query);


        if (isClass) {
            return res.status(200).json({ message: `Already Allotted this Time Slot to this Trainer`, success: false })
        }

        const newClass = new ClassModel({
            className,
            trainer,
            time
        })

        await newClass.save()

        const result = await newClass.populate('trainer', 'userName');
        const convertedDate = format(parse(result.time, 'HH:mm', new Date()), "h:mm a")

        return res.status(200).json({ message: "Class Is Created SuccessFully!!", success: true, result: { ...result.toObject(), time: convertedDate } })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sometimg Went Wrong"

        return res.status(500).json({ message: "failed To Create Class!!", success: false, error: errorMessage })
    }
}


const updateClass = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { className, trainer, time, id } = req.body;

        if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) {
            return res.status(400).json({ message: "Invalid time format. Use HH:mm", success: false });
        }

        const query = generatingClassQuery(trainer, time, id)
        const isClass = await ClassModel.findOne(query);

        if (isClass) {
            return res.status(200).json({ message: `Already Allotted this Time Slot to this Trainer`, success: false })
        }

        const updatedData = await ClassModel.findByIdAndUpdate(
            id,
            { className, trainer, time },
            { new: true }
        ).populate('trainer', 'userName')
            .lean()

        let convertedDate: null | string = null
        if (updatedData) {
            convertedDate = format(parse(updatedData?.time || '', 'HH:mm', new Date()), "h:mm a");
        }


        return res.status(200).json({ message: "Class Is Updated SuccessFully!!", success: true, result: { ...updatedData, convertedDate } })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sometimg Went Wrong"

        return res.status(500).json({ message: "failed To Update Class!!", success: false, error: errorMessage })
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
            .lean()

        // const pages={

        // }
        const result = classes.map(cls => ({ ...cls, time: format(parse(cls.time, 'HH:mm', new Date()), 'h:mm a') }));

        const totalClass = await ClassModel.countDocuments();

        const pages = {
            totalPages: Math.ceil(totalClass / limit),
            pageNum: Math.ceil(totalClass / limit) === 0 ? 0 : pageNum
        }

        return res.status(200).json({ message: "Classes Fetched Successfully", success: true, result: result, pages })
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
            .lean();

        const result = classes.map(cls => ({ ...cls, time: format(parse(cls.time, 'HH:mm', new Date()), "h:mm a") }))

        return res.status(200).json({ message: "Classes Fetched Successfully", success: true, result: result })
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

        let convertedDate: null | string = null
        if (updateClass) {
            convertedDate = format(parse(updateClass?.time || '', 'HH:mm', new Date()), "h:mm a");
        }


        // if (!updateClass) {
        //     return res.status(200).json({ message: "Class Already Marked As Complete!!", success: false })
        // }

        return res.status(200).json({ message: "Class Marked As Complete!!", success: true, return: { ...updateClass, time: convertedDate } })
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
            .lean();

        const result = classes.map(cls => ({ ...cls, time: format(parse(cls.time, 'HH:mm', new Date()), "h:mm a") }))

        return res.status(200).json({ message: "Classes Fetched Successfully", success: true, result: result })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sometimg Went Wrong"
        return res.status(500).json({ message: "failed To Fetch Class!!", success: false, error: errorMessage })
    }
}






// // this is use To Get Todays Class Attendence Data
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
            .lean()
        // const classAttendence = await ClassAttendenceModel.find()

        return res.status(200).json({ message: "Todays Attendence Summary Fetched Success!!", success: true, result: classAttendence })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Sometimg Went Wrong"
        return res.status(500).json({ message: "failed To Fetch Attendence Summary !!", success: false, error: errorMessage })
    }
}


const getClassAttendence = async (req: Request, res: Response): Promise<Response> => {
    const pageNum = parseInt(req.query.pageNum as string) || 1
    const limit = 15
    const classId = req.query.classId
    const date = req.query.date as string

    if (!classId || !date) {
        return res.status(200).json({ message: `${!date ? "Date Missing" : "ClassId Missing"}`, success: false })
    };

    try {
        let toggleDate
        if (date === 'todays') {
            toggleDate = new Date()
        } else if (date === 'yesterday') {
            toggleDate = subDays(new Date(), 1);
        }
        else {
            toggleDate = new Date(date)
        }

        const currentDate = format(toggleDate, 'yyyy-MM-dd')

        // this is use To get student summary for the mentioned date
        const classAttendence = await SummaryModel.find(
            {
                classId: classId,
                summary: { $elemMatch: { date: currentDate } }
            }

        ).populate('studentId', 'userName email')
            // .select('-summary')
            .skip((pageNum - 1) * limit)
            .limit(limit)
            .sort({ studentId: 1 })


        // this is use To get date Specific summary
        const dateFilteredSummary = classAttendence.map(doc => {
            const match = doc.summary?.find(summ => summ.date === currentDate)

            return {
                _id: doc._id,
                classId: doc.classId,
                studentId: doc.studentId,
                summary: match,
                __v: doc.__v,
            }
        })


        // this is use to get Total class data For the Mentioned Date
        const totalAttendence = await ClassAttendenceModel.findOne({ date: currentDate, classId })

        const totalDoc = await SummaryModel.countDocuments({
            classId: classId,
            summary: { $elemMatch: { date: currentDate } }
        })

        const pages = {
            totalPages: Math.ceil(totalDoc / limit),
            pageNum: Math.ceil(totalDoc / limit) === 0 ? 0 : pageNum
        }

        const result = {
            attendendStudents: dateFilteredSummary,
            totalAttendence: totalAttendence
        }

        return res.status(200).json({ message: "Todays Attendence Summary Fetched Success!!", success: true, result: result, pages })
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


export {
    addClass,
    updateClass,
    getClasses,
    getTodaysClassAttendence,
    weeklyClassAttendence,
    getActiveClasses,
    markCompleteClass,
    getClassReference,
    getClassAttendence
}