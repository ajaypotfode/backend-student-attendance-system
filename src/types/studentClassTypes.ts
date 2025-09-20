import { Document, Types } from "mongoose";

export interface StudentClass extends Document {
    studentId: Types.ObjectId,
    classId: Types.ObjectId,
    totalClass: number,
    attendence: number,
    absence: number
}