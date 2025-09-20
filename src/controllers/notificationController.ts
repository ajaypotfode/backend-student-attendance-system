import { Request, Response } from 'express'

import NotificationModel from "../models/notificationModel";
// import connectDatabse from "../utils/db"

const addNotification = async (req: Request, res: Response): Promise<Response> => {
    const { heading, details } = req.body

    try {
        const newNotification = new NotificationModel({
            heading, details
        })

        await newNotification.save()

        return res.status(200).json({ message: "Notification Added SuccessFully!!", success: true, result: newNotification })


    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "Failed To Add Notification!!", success: false, error: errorMessage })
    }
}



const getNotification = async (req: Request, res: Response): Promise<Response> => {

    try {
        const notifications = await NotificationModel.find().sort({ createdAt: 1 })
        return res.status(200).json({ message: "Notification Fetched SuccessFully!!", success: true, result: notifications })


    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "Failed To Fetch Notifications!!", success: false, error: errorMessage })
    }

}


const deleteNotification = async (req: Request, res: Response): Promise<Response> => {

    const { notificationId } = req.body

    try {
        const notifications = await NotificationModel.findByIdAndDelete(notificationId)

        if (!notifications) {
            return res.status(404).json({ message: "Notification Not Found!!", success: false })
        }

        return res.status(200).json({ message: "Notification Deleted SuccessFully!!", success: true, result: notifications })


    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Something Went Wrong"
        return res.status(500).json({ message: "Failed To Delete Notifications!!", success: false, error: errorMessage })
    }

}

export { addNotification, getNotification, deleteNotification }