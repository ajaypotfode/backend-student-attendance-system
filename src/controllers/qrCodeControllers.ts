import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { format, formatDate } from 'date-fns'
// import StudentModel from '../models/studentClassModel'
import SummaryModel from '../models/AttendenceSummaryModel'
// import connectDatabse from '../utils/db'
import StudentClassModel from '../models/studentClassModel'
import ClassAttendenceModel from '../models/ClassAttendenceModel'
import { Types } from 'mongoose'

const generateQrCode = async (req: Request, res: Response): Promise<Response> => {

    const studentId = req.user?.userId
    const { classId } = req.body
    const QR_SECRETE = process.env.QR_SECRETE || ""

    if (!studentId) {
        return res.status(200).json({ message: "missing StudentId" })
    }


    const qrdata = {
        studentId,
        classId,
        timeStamp: Date.now
    }

    const qrtoken = jwt.sign(qrdata, QR_SECRETE, { expiresIn: '1h' })


    try {
        const classAttendence = await StudentClassModel.findOne({ studentId, classId })
            .populate({
                path: 'classId',
                select: 'className time trainer',
                populate: {
                    path: 'trainer',
                    select: 'userName'
                }
            })

        if (!classAttendence) {
            return res.status(200).json({ message: "Student Not Found!!", success: false })
        }

        return res.status(200).json({ message: "Qr Genereated For Class!!", success: true, result: classAttendence, qrtoken })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something went wrong"
        return res.status(500).json({ message: "failed To fetch ClassAttendence!!", success: false, error: errorMessage })
    }
    // return res.json({ message: "Qr Genereated For Class", qrtoken })
}




const verifyQr = async (req: Request, res: Response): Promise<Response | void> => {
    const { qrdata, classId } = req.body
    // const studentId = req.user?.userId
    const QR_SECRETE = process.env.QR_SECRETE || ""
    const currentdate = format(new Date(), "yyyy-MM-dd")

    try {
        //   console.log("is qr :", qrdata);
        const decode = jwt.verify(qrdata, QR_SECRETE) as { classId: Types.ObjectId, studentId: Types.ObjectId }

        if (decode.classId.toString() !== classId) {
            return res.json({ message: "Student Not Having This Class!", success: false })
        }

        const qrScanned = await SummaryModel.findOne(
            {
                classId: decode.classId,
                studentId: decode.studentId,
                summary: { $elemMatch: { date: currentdate, present: true } } //$elemMatch Is Used To Match Element from Array
            },

        )

        if (qrScanned) {
            return res.json({ message: "Student Already Scanned Qr!", success: false })
        }


        await SummaryModel.findOneAndUpdate(
            { classId: decode.classId, studentId: decode.studentId },
            { $set: { 'summary.$[summ].present': true } },
            {
                arrayFilters: [
                    { 'summ.date': currentdate, 'summ.present': false }
                ],
                new: true
            }
        )

        const studentsdata = await StudentClassModel.findOneAndUpdate(
            { studentId: decode.studentId, classId: decode.classId },
            { $inc: { attendence: 1, absence: -1 } },
            { new: true }
        ).populate('studentId', 'username email contactNo role image')
            .populate('classId', 'className time')

        if (!studentsdata) {
            return res.status(404).json({ message: "Student Data Not Found!!", success: false })
        }

        // const totalStudents = await StudentClassModel.countDocuments({ classId: decode.classId })

        const todaysAttendence = await ClassAttendenceModel.findOneAndUpdate(
            { classId: decode.classId, date: currentdate },
            { $inc: { attendence: 1, absent: -1 } },
            { new: true }
        ).select('date absent attendence totalStudents')

        // const updateAttendence = await ClassAttendenceModel.findOneAndUpdate

        return res.json({ message: "Attendence Applied Success!!", success: true, students: studentsdata, attendence: todaysAttendence })

    } catch (error) {
        return res.json({ message: "Qr Expired", success: false, result: {} })
    }
}


const classStudentAttendence = async (req: Request, res: Response): Promise<Response | void> => {
    const { classId } = req.body
    // const userRole = req.user.role
    const currentdate = new Date();
    const formatdate = format(currentdate, "yyyy-MM-dd")
    try {

        // if (userRole !== 'admin') {
        //     return res.status(401).json({ message: "Admin Access Only!!", success: false })
        // }

        const todaysAttandence = await ClassAttendenceModel.findOne({ classId, date: formatdate })

        if (todaysAttandence?.toObject().isOpen === false) {
            return res.status(404).json({ success: false, message: "Class Closed For Today" });
        }

        const allStudents = await StudentClassModel.find({ classId: classId }).select('studentId').lean()

        if (allStudents.length === 0) {
            return res.status(404).json({ success: false, message: "No students found for this class" });
        }

        const studentIds = allStudents.map(student => student.studentId)

        const existingSummaries = await SummaryModel.find({
            classId,
            studentId: { $in: studentIds },
            'summary.date': formatdate
        }).select('studentId');

        // this is use to get all Students Ids
        const existingStudents = new Set(existingSummaries.map(summary => summary.studentId.toString()));

        // this is use to prevent duplicate data entry
        const newStudentIds = studentIds.filter(id => !existingStudents.has(id.toString()))


        if (!newStudentIds.length) {
            return res.json({ message: "Already Updated initial Students Summary", success: false })
        }

        const studentSummary = {
            date: formatdate,
            time: format(currentdate, "hh:mm a"),
            present: false,
        }

        // bulk update
        await SummaryModel.bulkWrite(
            newStudentIds.map((studentId) => ({
                updateOne: {
                    filter: { classId, studentId },
                    update: { $push: { summary: studentSummary } },
                    upsert: true
                }
            }))
        );


        await StudentClassModel.updateMany(
            { classId, studentId: { $in: newStudentIds } },
            { $inc: { totalClass: 1, absence: 1 } }
        )


        if (!todaysAttandence) {

            const attendenceData = new ClassAttendenceModel({
                classId,
                totalStudents: allStudents.length,
                date: formatdate,
                absent: allStudents.length,
                isOpen: true
            })

            await attendenceData.save()
        }

        return res.json({ message: "student Attendence Updated", success: true })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Somethimg Went Wrong"
        return res.json({ message: "failed To Updated Attendence", success: false, error: errorMessage })
    }
}



const closeClass = async (req: Request, res: Response): Promise<Response | void> => {
    const { classId } = req.body
    const formatdate = format(new Date(), "yyyy-MM-dd")
    try {

        const classAttendence = await ClassAttendenceModel.findOneAndUpdate(
            { classId, date: formatdate },
            { isOpen: false }

        ).populate('classId', 'className time isOpen')

        return res.json({ message: "Class Closed", success: true, result: classAttendence })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Somethimg Went Wrong"
        return res.json({ message: "failed To Close Class", success: false, error: errorMessage })
    }
}




export { generateQrCode, verifyQr, classStudentAttendence, closeClass }