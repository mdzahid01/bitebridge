import mongoose, {Schema, Document, model}from "mongoose";

export interface iTokenCounter extends Document{
    vendorId: mongoose.Schema.Types.ObjectId,
    date : string,
    seq: number
}

const TokenCouterSchema = new Schema<iTokenCounter>({
    vendorId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    seq:{
        type: Number,
        default: 0,
    }
})
TokenCouterSchema.index({vendorId:1,date:1},{unique:true})

const TokenCounter =  model<iTokenCounter>('tokenCounter',TokenCouterSchema);
export default TokenCounter