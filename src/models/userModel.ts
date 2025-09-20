
import mongoose, { Schema, Types } from "mongoose";
import { User } from "../types/userTypes";


const UserSchema: Schema<User> = new Schema({
    userName: {
        type: String,
        required: [true, "userName Is required"]
    },
    role: {
        type: String,
        required: [true, "Role Is required"]
    },
    email: {
        type: String,
        required: [true, "Email Is Required"],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password Is Required"]
    },
    image: {
        type: String,
        default: ""
    },
    contactNo: {
        type: String,
        required: [true, "Contact No Is Required"],
        unique: true,
        minlength: [10, "Contact No must be 10 digits"],
        maxlength: [10, "Contact No must be 10 digits"],
        match: [/^\d{10}$/, "Contact No must be exactly 10 digits"]
    },
    status: {
        type: String,
        required: true,
        default: 'active'
    }

}, { timestamps: true })


const UserModel = mongoose.models.users as mongoose.Model<User> || mongoose.model<User>("users", UserSchema)

export default UserModel