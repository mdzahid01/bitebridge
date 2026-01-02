import mongoose from "mongoose";

const connectDB = async(MONGOURI: string) =>{
    mongoose.connect(MONGOURI)
    .then(()=>{
        console.log("database connected successfully");
    })
    .catch((err:string)=>{
        console.log("error connecting to database: ",err);
        process.exit(1);
    })
}

export default connectDB