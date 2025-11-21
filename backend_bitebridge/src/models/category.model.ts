import mongoose,{Document,model,Schema} from "mongoose";

export interface iCategory extends Document{
    vendorId: mongoose.Schema.Types.ObjectId,
    name: string
}

const categorySchema = new Schema<iCategory>({
    vendorId :{
        type: mongoose.Types.ObjectId,
        ref: "Vendor",
        required: true,
        index : true
    },
    name:{
        type: String,
        required: [true,"Name is required"],
        trim : true,
    },
},{timestamps: true}
)

const Category = model<iCategory>("Category",categorySchema)
export default Category;