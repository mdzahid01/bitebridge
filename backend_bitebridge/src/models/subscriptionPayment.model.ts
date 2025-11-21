import mongoose,{Document, Schema, model, mongo} from "mongoose";

export interface iSubscriptionPayment extends Document{
    vendorId: mongoose.Schema.Types.ObjectId,
    planId: mongoose.Schema.Types.ObjectId,
    amount: number,
    method: 'upi' | 'card' | 'netbanking',
    status: 'pending' | 'paid' | 'failed',
    transactionId: string,
    startDate: Date,
    endDate: Date
}

const subscriptionPaymentSchema = new Schema<iSubscriptionPayment>(
    {
        vendorId:{
            type: Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true,
            index: true
        },
        planId: {
            type: Schema.Types.ObjectId,
            ref: 'SubscriptionPlan',
            required: true
        },
        amount:{
            type: Number,
            required: [true, 'Amount is required'],
            min: [0, 'Amount cannot be negative'],
        },
        method:{
            type: String,
            enum: ['upi', 'card', 'netbanking'],
            required:[true, "Payment method is required"],
        },
        status:{
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
         transactionId: {
            type: String,
            required: [true, 'Transaction ID is required'],
            unique: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    {timestamps: true}
);

const  SubscriptionPayment =  model<iSubscriptionPayment>("SubscriptionPayment", subscriptionPaymentSchema)
export default SubscriptionPayment;