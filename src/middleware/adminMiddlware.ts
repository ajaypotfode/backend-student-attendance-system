import { Request, Response, NextFunction } from 'express'

const adminMiddlware = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
        return res.status(401).json({ message: "User not authenticated", success: false })
    }

    if (req.user.role !== "admin" && req.user.status === 'active') {
        return res.status(403).json({ message: "Access denied. Admins only.", success: false })
    }

    next()

}

export default adminMiddlware