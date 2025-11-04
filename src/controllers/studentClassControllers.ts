import { Request, Response } from 'express'
import StudentClassModel from '../models/studentClassModel'
// import connectDatabse from '../utils/db'
import SummaryModel from '../models/AttendenceSummaryModel'
import { Types } from 'mongoose'
import UserModel from '../models/userModel'
import ClassModel from '../models/classModel'
import { format } from 'date-fns'
import { AttendenceSummary } from '../types/summaryTypes'
import ClassAttendenceModel from '../models/ClassAttendenceModel'
// import { time } from 'console'
// import StudentModel from '../models/studentClassModel'

const addStudentClass = async (req: Request, res: Response): Promise<Response> => {
    const { classId, studentsId } = req.body as { classId: string, studentsId: string[] }
    // const role = req.user.role

    try {

        let classAssignedStudents: { email: string, userName: string, contactNo: string, role: string, status: string }[] = []

        //(*** it is use to check is student Already into then StudentClassModel

        const assignedStudents = await StudentClassModel.find({
            classId,
            studentId: { $in: studentsId }
        }).select('studentId')


        // this is use To convert mongoose Id Into String
        const stringIds = assignedStudents.map(student => student.studentId.toString());

        // this is use To filter If existing student Id Is send By User
        const newStudent = studentsId.filter(id => !stringIds.includes(id))
        // ***)

        if (newStudent.length > 0) {
            const newStudentClass = newStudent.map(studentId => ({
                classId,
                studentId
            }));

            // this is use to insert Many Documents At One Time
            await StudentClassModel.insertMany(newStudentClass);

            await ClassModel.findByIdAndUpdate(
                classId,
                { $inc: { totalStudents: newStudent.length } },
                { new: true }
            )

            const studentData = await UserModel.find(
                { _id: { $in: newStudent }, role: 'student' }
            ).select('_id userName email contactNo role status')
            // .lean() is use to get Only Plain Object

            // it is not necessary to send to browser but if it is required then w'll use it in future 
            classAssignedStudents = studentData
        }

        return res.status(200).json({ message: "class Allocate Successfully!!", success: true, result: classAssignedStudents })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong"
        return res.status(500).json({ message: "class Allocate Successfully!!", success: false, error: errorMessage })
    }
}


// this is use to get Student Who do not have The Specific Class
const getAllClassStudents = async (req: Request, res: Response): Promise<Response> => {
    // const { classId, search} = req.query as { classId: string, search: string }
    const classId = req.query.classId as String
    const search = req.query.search as string || ""
    const pageNum = parseInt(req.query.pageNum as string) || 1
    const limit = 15;
    try {

        if (!classId) {
            return res.status(404).json({ message: "Please Mention ClassId First!!", success: false })
        }

        // Find all student IDs already in this class
        const assignedId = await StudentClassModel.find(
            { classId })
            .distinct('studentId')
        // distinct() Retrieves only unique studentId values from the collection (without including _id or full documents)

        // Find all active students NOT in the assigned list
        const students = await UserModel.find({
            _id: { $in: assignedId },
            $or: [
                { userName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ],
            status: 'active',
            role: 'student'
        })
            .skip((pageNum - 1) * limit)
            .limit(limit)
            .sort({ createdAt: 1, _id: 1 })
            .select('_id userName email contactNo status role')

        if (!students) {
            return res.status(200).json({ message: "No One Attending This Class!!", success: false })
        }

        const totalStudents = await UserModel.countDocuments({ _id: { $in: assignedId }, status: 'active', role: 'student' })


        const pages = {
            totalPages: Math.ceil(totalStudents / limit),
            pageNum: Math.ceil(totalStudents / limit) === 0 ? 0 : pageNum
        }


        return res.status(200).json({ message: "Available Students Fetched!!", success: true, result: students, pages })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong"
        return res.status(500).json({ message: "failed To fetch Clasees!!", success: false, error: errorMessage })
    }
}




// this is use to get Student Who do not have The Specific Class
const getUnAssignedClassStudents = async (req: Request, res: Response): Promise<Response> => {
    // const { classId, search} = req.query as { classId: string, search: string }
    const classId = req.query.classId as String
    const search = req.query.search as string || ""
    const pageNum = parseInt(req.query.pageNum as string) || 1
    const limit = 15;
    try {

        if (!classId) {
            return res.status(404).json({ message: "Please Mention ClassId First!!", success: false })
        }


        // Find all student IDs already in this class
        const assignedId = await StudentClassModel.find({ classId }).distinct('studentId')
        //distinct() Retrieves only unique studentId values from the collection (without including _id or full documents)

        // Find all active students NOT in the assigned list
        const students = await UserModel.find({
            _id: { $nin: assignedId },
            $or: [
                { userName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ],
            status: 'active',
            role: 'student'
        })
            .skip((pageNum - 1) * limit)
            .limit(limit)
            .sort({ createdAt: 1, _id: 1 })
            .select('_id userName email contactNo status role')

        if (!students) {
            return res.status(200).json({ message: "All Student Attending This Class!!", success: false })
        }

        const totalStudents = await UserModel.countDocuments({ _id: { $nin: assignedId }, status: 'active', role: 'student' })


        const pages = {
            totalPages: Math.ceil(totalStudents / limit),
            pageNum: Math.ceil(totalStudents / limit) === 0 ? 0 : pageNum
        }


        return res.status(200).json({ message: "Available Students Fetched!!", success: true, result: students, pages })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong"
        return res.status(500).json({ message: "failed To fetch Clasees!!", success: false, error: errorMessage })
    }
}



// this is use to show only Student Classes
const getStudentClasses = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user.userId;
    try {
        const classes = await StudentClassModel.find({ studentId })
            .populate({
                path: 'classId',
                select: 'className time trainer',
                populate: {
                    path: 'trainer',
                    select: 'userName'
                }
            })

        return res.status(200).json({ message: "Classes Fetched Successfully!!", success: true, result: classes })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong"
        return res.status(500).json({ message: "failed To fetch Clasees!!", success: false, error: errorMessage })
    }
}


// this is use To Students active Classes For Qr generation
const getStudentsActiveClasses = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user.userId;

    try {
        const classes = await StudentClassModel.find({ studentId })
            .populate({
                path: 'classId',
                select: 'className time',
                populate: {
                    path: 'trainer',
                    select: 'username'
                },
                match: { status: 'active' }//this is use get matched field in referenced Model 
            })
            .select('classId');

        const activeClasses = classes.filter(activeClass => activeClass.classId !== null)


        return res.status(200).json({ message: "Active classes Fetched Successfully!!", success: true, result: activeClasses })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong"
        return res.status(500).json({ message: "failed To fetch Active Clasees!!", success: false, error: errorMessage })

    }
}


// get Student Class Attendence Summary
const getStudentsAttendenceSummary = async (req: Request, res: Response): Promise<Response> => {
    const { classId, email } = req.query
    const pageNum = parseInt(req.query.pageNum as string) || 1
    const limit = 15;
    const skip = (pageNum - 1) * limit;


    // const studentId: undefined | Types.ObjectId = req.user?.userId || undefined;;
    try {

        let studentId: Types.ObjectId | undefined;

        if (!classId) {
            return res.status(404).json({ success: false, message: "Please Mention ClassId" });
        }

        if (email) {
            const user = await UserModel.findOne({ email }).select("_id");
            if (!user) {
                return res.status(404).json({ success: false, message: "No user found with the provided email." });
            }
            studentId = user._id;
        } else if (req.user?.userId) {
            studentId = req.user.userId;
        }

        // {*** This is use for Summary sessions count to track total Pages
        const summaryDoc = await SummaryModel.findOne({ studentId, classId }).select('summary -_id')
        if (!summaryDoc) {
            return res.status(404).json({ message: "No Attendance Summary Found", success: false })

        }

        const summaryCount = summaryDoc.summary.length

        // ****}

        const session = await SummaryModel.findOne(
            { studentId, classId },
            { summary: { $slice: [skip, limit] } } // this is use to get paginate data from array field
        )
            .populate('classId', 'className time')
            .populate('studentId', 'userName email')


        const totalClassAttendence = await StudentClassModel.findOne({ classId, studentId })
            .select('totalClass attendence absence -_id')

        if (!totalClassAttendence) {
            return res.status(404).json({ message: "Mentioned Student Not Having this Class!!", success: false })
        }

        const result = {
            sessions: session,
            totalClass: totalClassAttendence,
            // totalPages: Math.ceil(totalPages / limit),// Math.ceil is used to get the smallest integer greater than or equal to a number.
            // pageNum                                   // For example: Math.ceil(5 / 2) = 3
        }

        const pages = {
            totalPages: Math.ceil(summaryCount / limit),// Math.ceil is used to get the smallest integer greater than or equal to a number.
            pageNum: Math.ceil(summaryCount / limit) === 0 ? 0 : pageNum                                   // For example: Math.ceil(5 / 2) = 3
        }

        return res.status(200).json({ message: "classes Fetched Successfully!!", success: true, result: result, pages })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong"
        return res.status(500).json({ message: "failed To fetch Clasees!!", success: false, error: errorMessage })
    }
}



// Retrieves the attendance record of a student for the specified class
// this api Is Not In Used change after some time if it is not getting use
const getStudentAttendence = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user.userId
    const classId = req.query.classId;

    try {

        if (!classId) {
            return res.status(200).json({ message: "Please Mention ClassId!!", success: false })
        }

        const classAttendence = await StudentClassModel.find({ studentId, classId }).populate('classId', 'className trainer time')
        return res.status(200).json({ message: "classeAttendence Fetched Successfully!!", success: true, result: classAttendence })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong"
        return res.status(500).json({ message: "failed To fetch ClassAttendence!!", success: false, error: errorMessage })
    }
}



const markStudentAttendence = async (req: Request, res: Response): Promise<Response> => {
    const { classId, studentIds } = req.body as { classId: string, studentIds: string[] }
    const currentdate = format(new Date(), "yyyy-MM-dd")
    try {
        const markeStdAttendence = studentIds.map((studentId) => (
            {
                updateOne: {
                    filter: {
                        studentId: new Types.ObjectId(studentId),
                        classId: new Types.ObjectId(classId)

                    },
                    update: { $set: { 'summary.$[summ].present': true } },
                    arrayFilters: [
                        { 'summ.date': currentdate, 'summ.present': false }
                    ]
                }
            }
        ))
        const markedAttendence = await SummaryModel.bulkWrite(markeStdAttendence)
        // it is use to update the doc which is having the array 


        const studentsdata = await StudentClassModel.updateMany(
            { studentId: { $in: studentIds }, classId: classId },
            { $inc: { attendence: 1, absence: -1 } },
            { new: true }
        ).populate('studentId', '_id userName email contactNo status role')


        const todaysAttendence = await ClassAttendenceModel.findOneAndUpdate(
            { classId: classId, date: currentdate },
            { $inc: { attendence: 1, absent: -1 } },
            { new: true }
        ).select('date absent attendence totalStudents')

        return res.status(200).json({ message: "successfully marked Attendence !!", success: true, markedAttendence, studentsdata })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Somethimg Went Wrong"
        return res.json({ message: "failed To Updated Attendence", success: false, error: errorMessage })
    }
}

// const


// const getSingleClassAttendence = async (req: Request, res: Response): Promise<Response> => {
//     const studentId = req.user.userId
//     const classId = req.params?.classId


//     try {
//         const classAttendence = await StudentClassModel.findOne({ studentId, classId })
//         return res.status(200).json({ message: "classeAttendence Fetched Successfully!!", success: true, result: classAttendence })
//     } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : "Something went wrong"
//         return res.status(200).json({ message: "failed To fetch ClassAttendence!!", success: false, error: errorMessage })
//     }
// }




export {
    addStudentClass,
    getStudentClasses,
    getStudentsActiveClasses,
    getStudentsAttendenceSummary,
    getStudentAttendence,
    getUnAssignedClassStudents,
    getAllClassStudents,
    markStudentAttendence
}