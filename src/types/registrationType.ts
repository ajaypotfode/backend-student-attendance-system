import { Document, Types } from "mongoose";


export interface Registration extends Document {
    _id: Types.ObjectId
    orgName: string;
    registrationOpen?: boolean;
    registrationExpires?: Date | null;
}