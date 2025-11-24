import mongoose, { Document, model, Schema } from "mongoose";

export interface iMenuItem extends Document {
    vendorId: mongoose.Schema.Types.ObjectId,
    categoryId: mongoose.Schema.Types.ObjectId,
    name: string,
    price: number,
    availability: boolean,
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
        required: [true, "categoryId is required"],
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
        return `${process.env.BACKEND_URL}/media/menuItems/${this.imageUrl}`;
    }
});

const menuItem = model<iMenuItem>("MenuItem",menuItemSchema)
export default menuItem;