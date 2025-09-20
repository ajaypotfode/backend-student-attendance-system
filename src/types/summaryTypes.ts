import { Types } from "mongoose"

export interface Summary extends Document {
    date: string,
    time: string,
    present: boolean

}


export interface AttendenceSummary extends Document {
    // session:string,
    _id: Types.ObjectId
    classId: Types.ObjectId,
    studentId: Types.ObjectId
    summary: Summary[]

}