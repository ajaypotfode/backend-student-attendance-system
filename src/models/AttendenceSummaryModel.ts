import mongoose, { Model, Schema } from "mongoose";
import { AttendenceSummary, Summary } from "../types/summaryTypes";

const SummarySchema: Schema<Summary> = new Schema({
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    present: {
        type: Boolean,
        required: true,
        default: false
    }
}, { _id: false })



const AttendenceSummarySchema: Schema<AttendenceSummary> = new Schema({
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"classes"
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"users"
    },
    summary: [SummarySchema]
})

const SummaryModel = mongoose.models.summaries as Model<AttendenceSummary> || mongoose.model<AttendenceSummary>("summaries", AttendenceSummarySchema)

export default SummaryModel