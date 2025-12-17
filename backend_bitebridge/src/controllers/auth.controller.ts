import { Request, Response } from 'express'
import bcrypt from "bcrypt"
import validator from 'validator'
import fs from 'fs'

import User from '../models/user.model.js'
import generateTokenAndSetCookie from '../utils/generateToken.js'

// import crypto from "crypto"
// import jwt from 'jsonwebtoken'

const me = async (req: Request, res:  Response)=>{
    try{
        const user = req.user;
        res.status(200).json({
            message: "User profile fetched successfully",
            user: user,
        })

    }
    catch(error: any){
        console.log("Error in 'me' controller: ", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

const login = async (req: Request, res: Response) => {    
    try {
       const {email, password} = req.body;

       if(!email || !password){
        return res.status(400).json({
            message: "Both email and pasword required"
        })
       }

       if (!validator.isEmail(email)){
        return res.status(400).json({
            message: "Given email is not valid"
        })
       }

       const user = await User.findOne({email: email}).select("+password");

       if(!user){
        return res.status(400).json({
            message: "User not found",
        })
       }

       const isPasswordMatched = await user.comparePassword(password);
       if(!isPasswordMatched){
        return res.status(400).json({
            message: "Invalid Password"
        })
       }
       generateTokenAndSetCookie(user,res);
       
       const userObject = user.toObject();
       delete userObject.password;
       delete userObject.isDeleted;

       return  res.status(200).json({
        user:userObject,
        message:"Login  Succesfull",
       })



    } catch (error: any) {
        console.log("error:", error );
        res.status(500).json({
            message:"Internal server error",
            error: error.message
        })
    }
}


const signup = async (req: Request, res: Response) => {
    try {
        const {name,email,phone,password,role} = req.body;
        const imgURl = req.file;
        console.log(name,email,phone,password,role,imgURl?.originalname)
        
        if(!name || !email || !phone || !password || !role){
            if(imgURl){
                fs.unlinkSync(imgURl.path)
            }
            return res.status(400).json({
                message:"All Fields are Required"
            })
        }
        if(phone.length!==10){
            if(imgURl){
                fs.unlinkSync(imgURl.path)
            }
             return res.status(400).json({
                message: "Phone number must be 10 digit"
            })
        }
        const isNumberExist = await User.findOne({phone:phone})
         if(isNumberExist){    
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                message: "user Already exist with this Phone number"
            })
        }
        
        const existingUser = await User.findOne({email:email})

        if(existingUser){
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                message: "user Already exist with this email"
            })
        }

        if(!validator.isEmail(email)){
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                message: "given email is not valid"
            })
        }

        const newUser = new User({
            name,
            email,
            phone,
            password,
            role,
            imageUrl: req.file?req.file.filename:null
        })
        if(newUser.role ==="customer"){
            newUser.permissions = ["create_order","edit_own_ordered_Items","view_own_orders"]
        }else if(newUser.role === "vendorOwner"){
            newUser.permissions = [
                'manage_menu', 'view_orders', 'update_order_status', 
                'create_order', 'collect_payment', 'view_reports', 'manage_staff'
            ];
        }

        const savedUser = await newUser.save()

        generateTokenAndSetCookie(savedUser,res);

        const userResponse = savedUser.toObject();
        delete userResponse.password; 
        delete userResponse.isDeleted; 


        res.status(200).json({
            message:"user created successfully",
            user: userResponse,
        })
    } catch (error:any) {
        console.log(error.message)
        if (req.file) {
                fs.unlinkSync(req.file.path);
            }
        console.log("error:", error );
        res.status(500).json({
            message:"Internal server error",
            error: error.message
        })
        
    }
}

const logout = async(req: Request, res: Response)=>{
    res.clearCookie('jwt',{
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path:'/',
    });
    res.status(200).json({ message: "Logged out successfully" });
}


export {signup,login,logout,me}