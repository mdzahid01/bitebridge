import cloudinary from "../config/cloudinary.js";

const deleteImageFromCloudinary = async (file: Express.Multer.File) => {
            if (file && file.filename) {
                try {
                    // file.filename hi Cloudinary ka 'public_id' hota hai jab multer-storage-cloudinary use karte hain
                    await cloudinary.uploader.destroy(file.filename);
                } catch (error) {
                    console.log("Error deleting image from Cloudinary:", error);
                }
            }
        };

export {
    deleteImageFromCloudinary,

}