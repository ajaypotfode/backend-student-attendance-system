import mongoose, { Document, Schema, Types } from "mongoose";
import { ClassType } from "../types/classTypes";

const ClassSchema: Schema<ClassType> = new Schema({
    className: {
        type: String,
        required: [true, "class Name is Reauired"]
    },
    trainer: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Trainer is Required"],
        ref: 'users'
    },
    time: {
        type: String,
        required: [true, "class Time is Required"],
    },
    totalStudents: {
        type: Number,
        required: true,
        default: 0
    },
    status: {
        type: String,
        default: "active",
        required: true
    }
}, { timestamps: true })

const ClassModel = mongoose.models.classes as mongoose.Model<ClassType> || mongoose.model<ClassType>("classes", ClassSchema)

export default ClassModel