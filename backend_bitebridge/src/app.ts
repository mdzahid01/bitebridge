import dotenv from "dotenv"
dotenv.config()
import express ,{Application, Request ,Response} from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import path from "path"
import { fileURLToPath } from "url"
// import connectDB from "./config/database.js"
import authRouter from './routes/auth.routes.js'
import vendorRouter from "./routes/vendorOwner/vendor.routes.js"


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app : Application = express()

// essential middlewares
app.use(cors({origin: process.env.FRONTEND_URL || "*", credentials:true}))
app.use(cookieParser()) 
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//static media folder
app.use("/media",express.static(path.join(__dirname,"../media")))

// test route
app.get("/",(req:Request,res:Response)=>{
    res.send("working fine")
})

app.use("/api/auth", authRouter) 
app.use("/api/vendors", vendorRouter) 



export default app