import { Request, Response, NextFunction } from "express";
import fs from 'fs';
import path from "path";
import sharp from "sharp";

export const compressImage = async(req: Request, res: Response, next:NextFunction)=>{
    if(!req.file) return next();  // no  file -> skip all copression process
    try {
        const inputPath = req.file.path
        const fileDir = path.dirname(inputPath)
        const extension = path.extname(inputPath)
        
        // path.basename(path, ext?)
        // Argument 1: path (required)
        //     Ye full file path hota hai: 
        //     "uploads/menu/items/paneer.png"
        // Argument 2: ext (optional)
        //     Agar tum extension pass kar do,
        //     to basename me se wo extension hata diya जाता है।
        //     "uploads/menu/items/paneer"
        const fileName = path.basename(inputPath,extension)

        const outputPath = path.join(fileDir,`${fileName}.webp`);

        await sharp(inputPath).resize(800).webp({quality:70}).toFile(outputPath)

        fs.unlinkSync(inputPath)

        req.file.filename = path.basename(outputPath);
        req.file.path = outputPath
        req.file.mimetype = 'image/webp'

        next();

    } catch (err: any) {
        console.error("Image compression failed:", err);
        next(); // still continue
    }
}