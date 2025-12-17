import { Response } from "express";
// import  Jwt  from "jsonwebtoken";
import jwt from 'jsonwebtoken';
import { iUser } from "../models/user.model.js"; 

const generateTokenAndSetCookie = (user: iUser,res: Response)=>{
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
        // secure: process.env.NODE_ENV !== 'development',
        secure: true,
        // sameSite: 'strict',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
}

export default generateTokenAndSetCookie;