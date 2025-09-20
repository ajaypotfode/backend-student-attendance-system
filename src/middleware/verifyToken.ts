import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'

const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        // const token = req.headers?.authorization?.split(' ')[1] //Expecting Bearer Token
        const token = req.cookies?.attendencetoken
        // || req.headers?.authorization?.split(' ')[1]

        if (!token) {
            res.status(401).json({ message: "No token Provided!!", success: false });
            return;
        }

        const user = jwt.verify(token, process.env.JWT_SECRETE!) as {
            userId: Types.ObjectId,
            role: string,
            status: string,
            userName: string,
            image: string
        };

        if (!user) {
            res.status(401).json({ message: "Unauthorized user!!", success: false });
            return;
        }

        req.user = user
        next()

    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token', success: false });
    }
}

export default verifyToken
