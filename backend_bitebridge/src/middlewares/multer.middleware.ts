// src/middlewares/multer.middleware.ts
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js"; // .js extension zaruri hai NodeNext ke liye
import { Request, Response, NextFunction } from "express";

// Helper function to create storage for different folders
const createCloudinaryStorage = (folderName: string) => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: async (req, file) => {
            return {
                folder: folderName, // Cloudinary par folder ka naam (e.g., avatars, menuItems)
                format: 'webp',     // 🔥 Automatic WebP conversion (Jo sharp kar rha tha)
                public_id: `${file.fieldname}-${Date.now()}`, // Unique filename
                transformation: [  // 🔥 Automatic Resizing (Jo sharp kar rha tha)
                    { width: 800, crop: "limit" },
                    { quality: "auto" }
                ] 
            };
        },
    });
};

// ------------------------------ Filters (Validation) ------------------------------

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only images (jpeg, png, jpg, webp) are allowed.') as any, false);
    }
};

// ------------------------------ Multer Instances ------------------------------

// 1. Avatar Upload
const avatarStorage = createCloudinaryStorage("bitebridge/avatars");
const uploadAvatar = multer({ 
    storage: avatarStorage, 
    fileFilter, 
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// 2. Menu Item Upload
const menuItemStorage = createCloudinaryStorage("bitebridge/menuItems");
const uploadMenuItem = multer({ 
    storage: menuItemStorage, 
    fileFilter, 
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// 3. Vendor Image Upload
const vendorStorage = createCloudinaryStorage("bitebridge/vendors");
const uploadVendor = multer({ 
    storage: vendorStorage, 
    fileFilter, 
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// ------------------------------ Error Handler ------------------------------
function multerErrorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
            message: "File size must be less than 5MB"
        });
    }
    if (err instanceof Error) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
}

export { uploadAvatar, uploadMenuItem, uploadVendor, multerErrorHandler };