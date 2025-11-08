// import { Schema } from "inspector/promises";
import mongoose, { Schema } from "mongoose";
import { ClassAttendence } from "../types/classAttendenceTypes";

const ClassAttendenceSchema: Schema<ClassAttendence> = new Schema({
    classId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'classes'
    },
    date: {
        type: String,
        required: [true, "date Is Required"]
    },
    totalStudents: {
        type: Number,
        required: [true, "Total Class data Is Required"],
        default: 0
    },
    attendence: {
        type: Number,
        required: [true, "Present Student Data Is Required"],
        default: 0
    },
    absent: {
        type: Number,
        required: [true, "Absent Student Data Is Required"],
        default: 0
    },
    isOpen: {
        type: Boolean,
        required: [true, "isOpen Is Required"],
        default: false
    }

}, { timestamps: true })

const ClassAttendenceModel = mongoose.models.classattendences as mongoose.Model<ClassAttendence> || mongoose.model<ClassAttendence>("classattendences", ClassAttendenceSchema)

export default ClassAttendenceModel