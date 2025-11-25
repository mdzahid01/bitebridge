import { Request, Response, NextFunction } from "express";
import jwt ,{JwtPayload} from 'jsonwebtoken'
import User, {iUser} from "../models/user.model.js";

declare global{
    namespace Express{
        interface Request{
            user?:iUser,
        }
    }
}

const protectedRoute = async (req: Request, res: Response, next: NextFunction)=>{
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - No Token Provided' });
        }

        const decoded = jwt.verify(token,process.env.JWT_SECRET!) as JwtPayload
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized - Invalid Token' });
        }

        const user = await User.findById(decoded.id)
        if (!user){
            return res.status(404).json({ message: 'User not found' });
        }
        req.user = user;
        // console.log(user)
        next();

    } catch (error: any) {
        console.log("protectedRoute Error:", error.message);
        return res.status(500).json({
            message:"Internal Server Error"
        })
    }

}

export default protectedRoute;