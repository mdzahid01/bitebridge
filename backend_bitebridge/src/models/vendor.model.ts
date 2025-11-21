import mongoose,{Document,Schema,model} from "mongoose";

export interface iVendor extends Document{
    ownerId : mongoose.Schema.Types.ObjectId,
    shopName : string,
    address : string,
    imageUrl?: string
    subscriptionPlan: 'free' | 'pro' | 'premium',
    isOpen : boolean,
    subscriptionExpiry: Date,
    qrCode?: string
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
        type: String
    },
},
    {   timestamps: true,
        toJSON:{virtuals: true},
        toObject:{virtuals: true}, 
    }
)

vendorSchema.virtual('ImageUrl').get(function(){
    if(this.imageUrl){
        return `${process.env.BACKEND_URL}media/vendors/${this.imageUrl}`
    }
})

const Vendor = model<iVendor>("Vendor",vendorSchema)

export default Vendor;