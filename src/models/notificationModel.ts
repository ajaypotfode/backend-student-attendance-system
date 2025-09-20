import mongoose, { Model, Schema } from "mongoose";
import { Notification } from "../types/notificationTypes";

const NotificationSchema: Schema<Notification> = new Schema({
    heading: {
        type: String,
        required: [true, "Heading For Notification Is Inportant"]
    },
    details: {
        type: String,
        required: [true, "Notification Details iS important"]
    }
}, { timestamps: true })


const NotificationModel = mongoose.models.notifications as Model<Notification> || mongoose.model<Notification>("notifications", NotificationSchema)

export default NotificationModel