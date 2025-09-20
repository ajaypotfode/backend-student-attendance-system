import { User } from "../types/userTypes";
import { Response } from "express";

export const setToken = (response: Response, token: string) => {
    response.cookie("attendencetoken", token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        // sameSite: 'none',
        maxAge: 1000 * 60 * 60 * 24,
        path: '/'
    })
}