// import mongoose from "mongoose"

// const connectDatabse = async (): Promise<void> => {
//     const CONNECTION_STR = process.env.CONNECTION_STR || ""
//     try {
//         if (mongoose.connection.readyState === 1) {
//             console.log("Already database Connected");
//             return
//         }

//         await mongoose.connect(CONNECTION_STR)
//         console.log("Database Connected Successfully!!");
//     } catch (error) {
//         console.log("Failed To Connect With Database :", error);
//     }

// }


// export default connectDatabse