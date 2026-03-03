import { Request, Response, NextFunction } from "express";
import Vendor from "../models/vendor.model.js";

const checkVendorOwner = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== "vendorOwner") {
        return res.status(403).json({
            message: "Unauthorized: Only vendor Owner can access this route."
        })
    }
    next()
}

const checkVendorMember = (req: Request, res: Response, next: NextFunction) => {
    const allowedRoles = ['vendorOwner', 'vendorStaff']
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            message: "Unauthorized: Only vendor Owner Or Vendor Staff can access this route."
        })
    }
    next()
}

const checkVendorExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userVendorId = req.user?.vendorId
        if (!userVendorId) {
            return res.status(404).json({
                message: "Invalid Token: Vendor ID missing"
            })
        }
        const vendor = await Vendor.findById(userVendorId);
        if (!vendor) {
            return res.status(404).json({
                message: "No Vendor Profile Found: Please create a vendor profile first."
            });
        }
        next()
    } catch (error: any) {
        return res.status(500).json({
            message: "Server Error checking vendor existence",
            error: error.message
        });
    }
}

const checkIsVendorOpen = async (req:Request, res: Response, next: NextFunction)=>{
    try {
        const {vendorId} = req.body;
        if (!vendorId) {
            return res.status(400).json({ message: "Vendor ID is required" });
        }

        const vendor = await Vendor.findById(vendorId);

        if (!vendor) {
            return res.status(404).json({ message: "Shop not found" });
        }
        if (vendor.isOpen === false) {
            return res.status(400).json({ 
                message: `Sorry, ${vendor.shopName} is currently closed. We are not accepting orders right now.`,
                isVendorClose: true // Frontend ko signal dene ke liye
            });
        }
        next();
    } catch (error:any) {
        return res.status(500).json({ 
            message: "Error checking shop status", 
            error: error.message 
        });
    }
}

export default checkVendorOwner
export {
    checkVendorExist,
    checkVendorMember,
    checkIsVendorOpen,
}
