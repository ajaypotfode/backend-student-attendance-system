
// const express = require('express')
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import allRoutes from './routes/index'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'

const app = express()

dotenv.config(
    { path: './.env' }
)

// It enables your Express app to understand and parse JSON-formatted request bodies automatically
// it replace app.use(bodyParser.json());
app.use(express.json())

app.use(cookieParser())

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:5173',
        'http://localhost:5174',
        'https://students-dashboard-student-attendan.vercel.app',
        'https://admin-pannel-student-attendance-sys.vercel.app'
    ],
    credentials: true

}))

// app.use(cors({
//     origin: '*'
// }))

app.use('/v1', allRoutes)

async function startServer() {
    try {
        await mongoose.connect(process.env.CONNECTION_STR as string)
        // app.get('/', (req, res) => {
        //     res.send("test")
        // })
        // this is use get express error
        app.on("error", (error) => {
            console.log("server Error :", error);
        })

        app.listen(process.env.PORT || 4000, () => {
            console.log("server Running on Port 4000");

        })
    } catch (error) {
        console.log("server Running error:", error);
    }
}

startServer()