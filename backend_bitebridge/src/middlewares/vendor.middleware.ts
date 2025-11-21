import { Request, Response, NextFunction } from "express";

const checkVendorOwner = (req: Request, res: Response, next: NextFunction)=>{
    if(req.user?.role!=="vendorOwner"){
        return res.status(403).json({
            message:"Unauthorized: Only vendor Owner can access this route."
        })
    }
    next()
}

const checkVendorExist = (req: Request, res: Response, next: NextFunction)=>{
    if(!req.user?.vendorId){
        return res.status(404).json({
            message:"No Vendor Found: Create Vendor first"
        })
    }
    next()
}

export default checkVendorOwner
export {
    checkVendorExist
}
