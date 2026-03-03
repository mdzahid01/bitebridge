import mongoose, { Document, model, Schema } from "mongoose";

export interface iMenuItem extends Document {
    _id: mongoose.Types.ObjectId; // ye automatic hota hai but typescript error line na de isliye manually add kiya gya hai
    vendorId: mongoose.Schema.Types.ObjectId,
    categoryId: mongoose.Schema.Types.ObjectId,
    name: string,
    price: number,
    availability: boolean,
    isveg:boolean,
    imageUrl?: string,
}

const menuItemSchema = new Schema<iMenuItem>({
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: "Vendor",
        required: [true, "VendorId is required"],
        index: true,
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: "Category",
    },
    name: {
        type: String,
        required: [true, 'Menu item name is required'],
        trim: true,
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },
    availability: {
        type: Boolean,
        default: true,
    },
    isveg:{
        type: Boolean,
        default:true,
        // index:true
    },
    imageUrl: {
        type: String,
    },
},
    {
        timestamps: true,
        toJSON: { virtuals: true }, 
        toObject: { virtuals: true },
    }

)

menuItemSchema.virtual('fullImageUrl').get(function () {
    if (this.imageUrl) {
        return this.imageUrl;
    }
});

const MenuItem = model<iMenuItem>("MenuItem",menuItemSchema)
export default MenuItem;