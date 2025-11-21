// import dotenv from 'dotenv'
// dotenv.config()

import app from './app.js'
import connectDB from "./config/database.js"

const PORT = process.env.PORT
// console.log(PORT) //correct
// console.log(process.env.MONGO_URI) //correct
const startServer = async () =>{
    try{
        const MONGO_URI = process.env.MONGO_URI;
        if(!MONGO_URI){
            console.error("🔴 FATAL ERROR: MONGO_URI is not defined in the .env file.");
            process.exit(1); 
        }

        await connectDB(MONGO_URI);

        app.listen(PORT,()=>{
        console.log(`🚀 Server running on http://localhost:${PORT}`);
})
    }catch(err: any){
        console.log("🔴 Server startup failed:", err);
    }
}
startServer();