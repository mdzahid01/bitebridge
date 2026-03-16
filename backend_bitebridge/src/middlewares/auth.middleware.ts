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
        let token;
        if (req.cookies?.jwt) {
            token = req.cookies.jwt;
        }else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
            // "Bearer <token>" me se sirf token nikalo
            token = req.headers.authorization.split(" ")[1]; 
        }
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

const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    try {
        // Safe check for cookies object
        let token = req.cookies?.jwt; 
        
        // Agar cookie mein nahi hai, toh header check karo
        if (!token && req.headers.authorization?.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            console.log("optionalAuth: No token found, proceeding as Guest.");
            return next(); 
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded as any; 
        console.log("optionalAuth: Token found & verified! User ID:", req.user?.id);
        
        return next(); // 👈 RETURN lagana zaroori hai

    } catch (error) {
        console.log("optionalAuth: Token invalid/expired, proceeding as Guest.");
        return next(); 
    }
};

export default protectedRoute;
export {optionalAuth}