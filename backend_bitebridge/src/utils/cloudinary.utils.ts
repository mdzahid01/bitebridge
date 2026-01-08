import cloudinary from "../config/cloudinary.js";
import "multer";

const deleteImageFromCloudinary = async (imageparam: Express.Multer.File | string) => {
    try {
        let public_id = ""
        if(typeof imageparam==='object' && imageparam !== null && 'filename' in imageparam){
            public_id = imageparam.filename
        }
        else if(typeof imageparam === 'string'){
        // file.filename hi Cloudinary ka 'public_id' hota hai jab multer-storage-cloudinary use karte hain
        // https://res.cloudinary.com/dfcl6loiy/image/upload/v1767372988/bitebridge/vendors/shopImage-1767372986753.webp
        // bitebridge/vendors/shopImage-1767372986753 - ye iski public_id hai so ye nikalna hai abhi
            const part = imageparam.split('/upload/')
            if(part.length>1){
                const pathPart = part[1];   // v1767372988/bitebridge/vendors/shopImage-1767372986753.webp yahan pe itna ho gya
                public_id = pathPart?.replace(/v\d+\//, "").split('.')[0] || ""
            }
            else{
                public_id = imageparam
            }
        }
        if(public_id){
            await cloudinary.uploader.destroy(public_id);
            console.log(`Deleted from Cloudinary: ${public_id}`);
        }
    } catch (error) {
        console.log("Error deleting image from Cloudinary:", error);
    }
    
};

export {
    deleteImageFromCloudinary,

}