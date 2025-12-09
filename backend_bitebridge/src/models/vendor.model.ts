import mongoose,{Document,Schema,model} from "mongoose";

export interface iVendor extends Document{
    ownerId : mongoose.Schema.Types.ObjectId,
    shopName : string,
    slug: string,
    address : string,
    imageUrl?: string
    fullImageUrl?: string; // Virtual property for frontend
    subscriptionPlan: 'free' | 'pro' | 'premium',
    isOpen : boolean,
    subscriptionExpiry: Date,
    qrCode?: string
    fullQrCodeUrl?: string; // Virtual property for frontend
}

const vendorSchema = new Schema<iVendor>({
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shopName: {
        type: String,
        required:[true,"Shop name is required"],
        trim: true,
    },
    slug:{
        type: String,
        index: true,
        unique: true,
        required:[true,'slug is required'],
    },
    address: {
        type: String,
        required:[true,'Address is required'],
    },
    imageUrl: {
        type: String,
    },
    isOpen:{
        type: Boolean,
        default: false
    },
    subscriptionPlan:{
        type: String,
        enum:['free','pro','premium'],
        default:"free",
    },
    subscriptionExpiry:{
        type: Date,
        required: true,
    },
    qrCode:{
        type: String,
        default: null,
    },
},
    {   timestamps: true,
        toJSON:{virtuals: true},
        toObject:{virtuals: true}, 
    }
)

vendorSchema.virtual('fullImageUrl').get(function(){
    if(this.imageUrl){
        return `${process.env.BACKEND_URL}/media/vendors/${this.imageUrl}`
    }
})

vendorSchema.virtual('fullQrCodeUrl').get(function(){
    if(this.qrCode){
        return `${process.env.BACKEND_URL}/media/qrcodes/${this.qrCode}`
    }
})

const Vendor = model<iVendor>("Vendor",vendorSchema)

export default Vendor;