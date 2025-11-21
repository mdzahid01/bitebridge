import multer from "multer";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDirectoryExist = (directory:string)=>{
    if(!fs.existsSync(directory)){
        fs.mkdirSync(directory,{recursive:true})
    }
}

const avatarDir = path.join(__dirname, "..","..","media","avatars") //for user's avatar
const menuItemDir = path.join(__dirname, "..","..","media","menuItems") //  for menu item
const vendorDir = path.join(__dirname, "..","..","media","vendors")  // for vendor Image 

ensureDirectoryExist(avatarDir)
ensureDirectoryExist(menuItemDir)
ensureDirectoryExist(vendorDir)


// ------------------------------avatar--------------------------------------

const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, avatarDir);
    },
    filename: (req, file, cb) => {
        const tempName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, tempName);
    },
});

const uploadAvatar = multer({ 
    storage: avatarStorage,
    fileFilter : (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if(allowedTypes.includes(file.mimetype)){
            cb(null, true)
        }else{
            cb(new Error('Only images are allowed for avatars.'))
        }
    },
    limits: {fileSize: 1024 * 1024 * 2} //2mb max
});


// ------------------------------menu-Item--------------------------------------

const menuItemStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, menuItemDir);
    },
    filename: (req, file, cb) => {
        const tempName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, tempName);
    },
});

const uploadMenuItem = multer({ 
    storage: menuItemStorage,
    fileFilter : (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if(allowedTypes.includes(file.mimetype)){
            cb(null, true)
        }else{
            cb(new Error('Only images are allowed for menu items.'))
        }
    },
    limits: {fileSize: 1024 * 1024 * 2} //2mb max
});

// ------------------------------vendor-Img--------------------------------------

const vendorStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, vendorDir);
    },
    filename: (req, file, cb) => {
        const tempName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
        cb(null, tempName);
    },
});

const uploadVendor = multer({ 
    storage: vendorStorage,
    fileFilter : (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if(allowedTypes.includes(file.mimetype)){
            cb(null, true)
        }else{
            cb(new Error('Only images are allowed for vendor image.'))
        }
    },
    limits: {fileSize: 1024 * 1024 * 2} //2mb max
});

export { uploadAvatar,uploadMenuItem,uploadVendor}