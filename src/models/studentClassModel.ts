import mongoose, { Model, Schema } from "mongoose";
import { StudentClass } from "../types/studentClassTypes";

// const SummarySchema: Schema<Summary> = new Schema({
//     date: {
//         type: String,
//         required: true
//     },
//     time: {
//         type: String,
//         required: true
//     },
//     // absent: {
//     //     type: Boolean,
//     //     required: true,
//     //     default: true
//     // },
//     present: {
//         type: Boolean,
//         required: true,
//         default: false
//     }
// })


const StudentClassSchema: Schema<StudentClass> = new Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Student Id Is Required"],
        ref: 'users'
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Class Is Required"],
        ref:'classes'
    },
    // summary: [SummarySchema],
    totalClass: {
        type: Number,
        required: [true, "Total Classes are Required"],
        default: 0
    },
    attendence: {
        type: Number,
        required: [true, "Attendence are Required"],
        default: 0
    },
    absence: {
        type: Number,
        required: [true, "Absence are Required"],
        default: 0
    }
})


const StudentClassModel = mongoose.models.studentClasses as Model<StudentClass> || mongoose.model<StudentClass>("studentClasses", StudentClassSchema)

export default StudentClassModel