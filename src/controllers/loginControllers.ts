import { Response, Request } from 'express'
import UserModel from '../models/userModel'
import { compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { setToken } from '../utils/setToken'

const loginUser = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { password, email } = req.body
        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: "Invalid Email!!", success: false })
        }

        const isVerifiedPassword = await compare(password, user.password)

        if (!isVerifiedPassword) {
            return res.status(404).json({ message: "Invalid Password!!", success: false })
        }


        // this is use to handle user Access
        if (user.status === 'block') {
            return res.status(404).json({ message: "Your Are Blocked By Organaztion!!", success: false })
        }

        const SECRETE_KEY = process.env.JWT_SECRETE || ""

        const token = jwt.sign({
            userId: user._id,
            role: user.role,
            status: user.status,
            image: user.image,
            userName: user.userName
        },
            SECRETE_KEY,
            {
                expiresIn: '1d'
            })

        const result = user.toObject()
        result.password = ""

        // this function Is Used To Set Token On Cookies For frontend Use
        setToken(res, token)

        return res.status(200).json({ message: "User Loged In Successsfully!!", success: true, result: result, token })

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "User login failed!!", success: false, error: errorMessage })
    }
}


const getUserStatus = async (req: Request, res: Response): Promise<Response> => {
    const user = req.user;
    return res.status(200).json({ message: "get User Status Success!!", success: true, result: user })
}


const logOutUser = (req: Request, res: Response) => {
    res.clearCookie("attendencetoken", {
        httpOnly: true,
        secure:true,
        sameSite: 'strict',
        // sameSite: 'none',
        path: '/'
    })
    return res.status(200).json({ message: "User Log Out Successsfully!!", success: true })
}

export { loginUser, logOutUser, getUserStatus }