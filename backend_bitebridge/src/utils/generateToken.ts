import { Response } from "express";
// import  Jwt  from "jsonwebtoken";
import jwt from 'jsonwebtoken';
import { iUser } from "../models/user.model.js"; 

const generateTokenAndSetCookie = (user: iUser,res: Response)=>{
    
    const isProduction = process.env.NODE_ENV === 'production'

    const token = jwt.sign(
        {
            id: user._id,
            role: user.role,
            name: user.name,
            email: user.email,
        },
        process.env.JWT_SECRET!,
        {
            expiresIn:'7d',
        }
    );

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: isProduction,
        // sameSite: 'strict',
        sameSite: isProduction? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

export default generateTokenAndSetCookie;