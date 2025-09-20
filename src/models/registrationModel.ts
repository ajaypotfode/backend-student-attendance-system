import mongoose, { Schema } from "mongoose";
import { Registration } from "../types/registrationType";

const RegistrationSchema: Schema<Registration> = new Schema({
    orgName: {
        type: String,
        unique: true,
        required: true
    },
    registrationOpen: {
        type: Boolean,
        // required: true,
        default: false
    },
    registrationExpires: {
        type: Date,
        // required: true,
        default: null
    }

})

const RegistrationModel = mongoose.models.registrations as mongoose.Model<Registration> || mongoose.model<Registration>('registrations', RegistrationSchema);

export default RegistrationModel