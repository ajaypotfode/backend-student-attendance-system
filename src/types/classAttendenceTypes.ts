import { Document, Types } from "mongoose";

export interface ClassAttendence extends Document {
    classId: Types.ObjectId,
    date: string,
    totalStudents: number,
    attendence: number,
    absent: number,
    isOpen: boolean
}