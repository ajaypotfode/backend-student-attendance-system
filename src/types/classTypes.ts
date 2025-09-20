import { Document, Types } from "mongoose";

export interface ClassType extends Document {
    _id: Types.ObjectId,
    className: string,
    trainer: Types.ObjectId,
    totalStudents: number,
    time: string,
    status: 'complete' | 'active'
}