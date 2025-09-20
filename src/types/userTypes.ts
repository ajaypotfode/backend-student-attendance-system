import { Document, Types } from "mongoose";

export interface User extends Document {
    _id: Types.ObjectId,
    userName: string,
    role: "admin" | "student" | "trainer",
    email: string,
    image: string,
    password: string,
    contactNo: string,
    status: 'active' | "block"
}
