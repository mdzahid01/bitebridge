import mongoose,{model,Schema,Document} from "mongoose";

export interface iOrderItem extends Document {
    itemId: mongoose.Schema.Types.ObjectId,
    name: string,
    qty: number,
    price: number,
    status: "pending" | "preparing" | "ready" | "delevered" | "cancelled", 
}

export interface iOrder extends Document{
    vendorId: mongoose.Schema.Types.ObjectId,
    customerId?: mongoose.Schema.Types.ObjectId,
    tokenNo: string,
    paymentMethod: 'upi' | 'cash' | 'card',
    transactionId?: string,
    totalAmount: number,
    items: iOrderItem[],
    createdBy?: mongoose.Schema.Types.ObjectId,
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
        enum: ['pending', 'preparing', 'ready', 'delivered', 'cancelled'],
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