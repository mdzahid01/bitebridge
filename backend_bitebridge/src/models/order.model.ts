import mongoose,{model,Schema,Document} from "mongoose";

export interface iOrderItem extends Document {
    itemId: mongoose.Schema.Types.ObjectId,
    name: string,
    qty: number,
    price: number,
    status: "pending" | "served", 
}

export interface iOrder extends Document{
    vendorId: mongoose.Schema.Types.ObjectId,
    customerId?: mongoose.Schema.Types.ObjectId | null,
    tokenNo: string,
    customerDetail: {
        name: string,
        phone:string,
    },
    orderStatus: "pending" | "completed"
    paymentMethod: 'upi' | 'cash',
    transactionId?: string | null,
    totalAmount: number,
    items: iOrderItem[],
    createdBy?: mongoose.Schema.Types.ObjectId | null,
}

const orderItemSchema = new Schema<iOrderItem>({
    itemId: {
        type: Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    qty:{
        type: Number,
        required: true,
        min:[1,'Quantity must be at least 1']
    },
    price: {
        type: Number,
        required: true,
        min: [0,'Price cannot be negative']
    },
    status: {
        type: String,
        enum: ['pending', 'served'],
        default: 'pending',
    },  
})

const orderSchema = new Schema <iOrder>({
    vendorId: {
        type: Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
        index: true,
    },
    customerId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null, // Default to null for guest orders
    },
    customerDetail:{
        name: {type:String, required: true},
        phone: {type:String, required: true}
    }
    ,
    orderStatus:{
        type: String,
        enum: ["pending", 'completed'],
        default: "pending",
        index: true
    }
    ,
     tokenNo: {
        type: String,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ['upi', 'cash', 'card'],
        required: true,
    },
    transactionId: {
      type: String,
      default: null,
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, 'Total amount cannot be negative'],
    },
    items: [orderItemSchema], // Array of sub-documents
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the staff member who created the order
        default: null,
    },    

},  {timestamps: true}

)


const Order = model<iOrder>('Order', orderSchema);

export default Order;