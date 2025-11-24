import  mongoose, { Document, model, Schema } from "mongoose";

export interface iOrderPayment extends Document{
    orderId: mongoose.Schema.Types.ObjectId,
    vendorId: mongoose.Schema.Types.ObjectId,
    customerId?: mongoose.Schema.Types.ObjectId | null,
    amount: number,
    method: 'upi' | 'card' | 'cash',
    status: 'pending' | 'paid' | 'failed' | 'refunded',
    transactionId?: string| null,
}

const orderPaymentSchema = new Schema<iOrderPayment>(
    {
        orderId: {
            type: Schema.Types.ObjectId,
            required: true,
            unique: true,
        },
       vendorId: {
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true,
            index: true,
        },
        customerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        amount: {
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
        },
        method: {
            type: String,
            enum: ['upi', 'card', 'cash'],
            required: [true, 'Payment method is required'],
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        transactionId: {
            type: String,
            default: null, // Cash payments ke liye null ho sakta hai
        },
    },{timestamps:true}
)

const OrderPayment = model<iOrderPayment>("OrderPayment",orderPaymentSchema)
export default OrderPayment;

