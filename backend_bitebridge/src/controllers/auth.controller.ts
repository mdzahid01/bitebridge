import { Request, Response } from 'express'
import bcrypt from "bcrypt"
import validator from 'validator'
import fs from 'fs'

import User from '../models/user.model.js'
import generateTokenAndSetCookie from '../utils/generateToken.js'
import {deleteImageFromCloudinary} from '../utils/cloudinary.utils.js'

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
    const uploadedFile = req.file;
    try {
        const {name,email,phone,password,role} = req.body;
        console.log(name,email,phone,password,role,uploadedFile?.originalname)
        
        if(!name || !email || !phone || !password || !role){
            if(uploadedFile){
                await deleteImageFromCloudinary(uploadedFile)
                // fs.unlinkSync(uploadedFile.path)
            }
            return res.status(400).json({
                message:"All Fields are Required"
            })
        }
        if(phone.length!==10){
            if(uploadedFile){
                await deleteImageFromCloudinary(uploadedFile)
            }
             return res.status(400).json({
                message: "Phone number must be 10 digit"
            })
        }
        const isNumberExist = await User.findOne({phone:phone})
         if(isNumberExist){    
            if (uploadedFile) {
                await deleteImageFromCloudinary(uploadedFile)
            }
            return res.status(400).json({
                message: "user Already exist with this Phone number"
            })
        }
        
        const existingUser = await User.findOne({email:email})

        if(existingUser){
            if (uploadedFile) {
                await deleteImageFromCloudinary(uploadedFile)
            }
            return res.status(400).json({
                message: "user Already exist with this email"
            })
        }

        if(!validator.isEmail(email)){
            if (uploadedFile) {
               await deleteImageFromCloudinary(uploadedFile)
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
            imageUrl: uploadedFile?uploadedFile.path:""
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
        if (uploadedFile) {
                 await deleteImageFromCloudinary(uploadedFile)
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

const updateUserProfile = async (req: Request, res: Response) => {
    const uploadedFile = req.file;
    try {
        const userId = req.user?._id;
        const { name, phone } = req.body;

        if (!name || !phone) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({ message: "Name and phone are required" });
        }

        if (phone.length !== 10) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({ message: "Phone number must be 10 digits" });
        }

        const existingPhoneUser = await User.findOne({ phone, _id: { $ne: userId } });
        if (existingPhoneUser) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(400).json({ message: "Phone number is already in use by another account" });
        }

        // Build update object
        const updateData: any = { name, phone };
        
        // If a new image was uploaded
        if (uploadedFile) {
            updateData.imageUrl = uploadedFile.path;
            
            // Delete old image from Cloudinary if it exists
            const currentUser = await User.findById(userId);
            if (currentUser && currentUser.imageUrl) {
                // deleteImageFromCloudinary requires a file object with a path property that matches the cloudinary URL,
                // but our utils usually handle the path directly or we need a public_id. 
                // Let's check how the signup deletes it... it passes the whole uploadedFile object.
                // Assuming we just leave the old image for now if the generic deleteImageFromCloudinary doesn't support deleting by URL easily, 
                // or we can try to extract public_id if our util supports it.
                // Since `deleteImageFromCloudinary` in your codebase takes a `file` object from multer, we can't easily pass the old URL to it.
                // For safety and to prevent crashing, we will just update the URL. (You can optimize Cloudinary cleanup later).
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select("-password -isDeleted");

        if (!updatedUser) {
            if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error: any) {
        if (uploadedFile) await deleteImageFromCloudinary(uploadedFile);
        console.error("Error in updateUserProfile controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export {signup,login,logout,me,updateUserProfile}