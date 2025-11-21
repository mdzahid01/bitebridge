import mongoose,{ Document ,Schema, model } from "mongoose";

export interface iSubscriptionPlan extends Document{
    name: string,
    price: number,
    durationInDays: number,
    maxVendors: number,
    maxStaff: number,
    trialPeriodDays?: number,
    features: string[],
    status: 'active' | 'inactive'
}

const subscriptionPlanSchema = new Schema<iSubscriptionPlan>(
    {
        name: {
            type: String,
            required: [true, 'Plan name is Required'],
            unique: true,
            trim: true,
        },
        price:{
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
    durationInDays: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 day'],
    },
    maxVendors: {
      type: Number,
      required: [true, 'Max vendors limit is required'],
      min: [1, 'Must allow at least 1 vendor'],
    },
    maxStaff: {
      type: Number,
      required: [true, 'Max staff limit is required'],
      min: [0, 'Staff limit cannot be negative'],
    },
    features: {
      type: [String],
      required: true,
    },
    trialPeriodDays: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
}, {timestamps: true}
)

const SubscriptionPlan = model<iSubscriptionPlan>("SubscriptionPlan",subscriptionPlanSchema)
export default SubscriptionPlan;