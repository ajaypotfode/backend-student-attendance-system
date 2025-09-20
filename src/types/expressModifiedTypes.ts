import { Types } from "mongoose";

declare global {
    namespace Express {
        interface Request {
            user: {
                userId: Types.ObjectId,
                role: string,
                status: string,
                userName: string,
                image: string
            },
            // org: {
            //     orgId: Types.ObjectId
            // }
        }
    }
}