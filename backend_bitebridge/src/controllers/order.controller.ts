import { Request, Response } from "express";
import mongoose from "mongoose";
import Order from "../models/order.model.js";
import MenuItem from "../models/menuItem.model.js";
import TokenCounter from "../models/tokenCounter.model.js";

const generateDailyToken = async (vendorId: string) => {
    const today = new Date().toISOString().split('T')[0] // (e.g., "2023-10-25")

    const counter = await TokenCounter.findOneAndUpdate(
        { vendorId: vendorId, date: today },
        { $inc: { seq: 1 } },// Update: Sequence ko +1 karo
        { new: true, upsert: true } // Options: New value return karo, agar nahi hai to bana do
    );

    return String(counter.seq)

}


const placeOrder = async (req: Request, res: Response) => {
    try {
        const {
            vendorId,
            items,
            customerDetails,
        } = req.body;

        const customerId = req.user?._id
        console.log("Body mil rahi hai ya nahi?", req.body);

        console.log("vendorID: ", vendorId)
        console.log("items: ", items)
        console.log("customerDetails: ", customerDetails)

        // 1. Basic Validation
        if (!vendorId || !items || items.length === 0 || !customerDetails) {
            return res.status(400).json({ message: "Incomplete order details" });
        }

        // 2. SECURITY CHECK: Price Verification from DB 
        // Frontend se aayi price par bharosa nahi karenge.
        let calculatedTotalAmount = 0;
        const finalOrderItems = [];

        for (const item of items) {
            // Frontend se sirf 'itemId' aur 'qty' lenge
            const dbItem = await MenuItem.findOne({ _id: item.itemId });

            if (!dbItem) {
                return res.status(404).json({ message: `Item not found: ${item.name}` });
            }

            // Verify Vendor (Security)
            if (dbItem.vendorId.toString() !== vendorId) {
                return res.status(400).json({ message: "Item does not belong to this vendor" });
            }

            if (!dbItem.availability) {
                return res.status(400).json({ message: `Item ${dbItem.name} is currently unavailable` });
            }

            // Calculate Price (DB Price * Qty)
            const itemTotal = dbItem.price * item.qty;
            calculatedTotalAmount += itemTotal;

            // Final Item Object 
            finalOrderItems.push({
                itemId: dbItem._id,
                name: dbItem.name,
                qty: item.qty,
                price: dbItem.price, // DB wala original price
                status: "pending"
            });
        }

        //  Token Generation
        const newToken = await generateDailyToken(vendorId);

        //  Order Object Banao
        const newOrder = new Order({
            vendorId,
            customerId: customerId || null, // Guest hai to null
            tokenNo: newToken,
            customerDetail: {
                name: customerDetails.name,
                phone: customerDetails.phone
            },
            items: finalOrderItems,
            totalAmount: calculatedTotalAmount, // Verified Total
            orderStatus: "created"
        });

        // 5. Save to DB
        const savedOrder = await newOrder.save();

        return res.status(201).json({
            message: "Order placed! Please pay at counter.",
            orderId: savedOrder._id,
            tokenNo: savedOrder.tokenNo,
            totalAmount: savedOrder.totalAmount,

        });

    } catch (error: any) {
        console.error("Create Order Error:", error);
        return res.status(500).json({ message: "Order creation failed", error: error.message });
    }
};

const getGuestOpenOrders = async (req: Request, res: Response) => {
    try {
        const { orderIds } = req.body //arrays of orderId

        if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
            return res.status(200).json({
                messeage: "NO order Ids",
                orders: []
            })
        }

        const orders = await Order.find(
            { _id: { $in: orderIds }, orderStatus: { $in: ["created", "preparing", "ready"] } }
        ).sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(200).json({
                messeage: "NO Open Orders Yet",
                orders,
            })
        }

        return res.status(200).json({
            message: "Open Orders fetched",
            orders: orders,
        })

    } catch (error: any) {
        console.error("GetGuestOpenOrder Error:", error);
        return res.status(500).json({ message: "Order fetching failed", error: error.message });
    }
}
const getCustomerOpenOrders = async (req: Request, res: Response) => {
    try {
        const customerId = req.user?.id;
        if (!customerId) return res.status(401).json({ message: "Unauthorized" })

        const orders = await Order.find(
            { customerId: customerId, orderStatus: { $in: ["created", "preparing", "ready"] } }
        ).sort({ createdAt: -1 });

        if (!orders || orders.length === 0) {
            return res.status(200).json({
                messeage: "NO Open Orders Yet",
                orders,
            })
        }
        return res.status(200).json({
            message: "Open Orders fetched",
            orders: orders,
        })
    } catch (error: any) {
        console.error("GetCustomerOpenOrder Error:", error);
        return res.status(500).json({ message: "Order fetching failed", error: error.message });
    }
}

const getCustomerPreviousOrder = async (req: Request, res: Response) => {
    try {
        const customerId = req.user?.id;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || ""; // NAYA: Search query

        const skip = (page - 1) * limit;

        // Base filter
        const filter: any = {
            customerId: customerId,
            orderStatus: { $in: ["completed", "cancelled"] },
        };
        if (!customerId) return res.status(401).json({ message: "Unauthorized" })

        const [orders, totalOrders] = await Promise.all([
            Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments(filter)
        ]);

        if (!orders || orders.length === 0) {
            return res.status(200).json({
                message: "No order Found",
                orders: [],
                totalOrders: 0,
                totalPage: 0,
                currentPage: page
            });
        }

        return res.status(200).json({
            message: "History fetched",
            orders,
            totalOrders,
            hasMore: (skip + orders.length) < totalOrders,
            totalPage: Math.ceil(totalOrders / limit),
            currentPage: page
        });
    } catch (error: any) {
        console.error("GetCustomerOpenOrder Error:", error);
        return res.status(500).json({ message: "Order fetching failed", error: error.message });
    }
}


const acceptOrder = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.body;
        const vendorId = req.user?.vendorId;

        const order = await Order.findOne({
            _id: orderId,
            vendorId: vendorId,
            orderStatus: "created"
        })

        if (!order) {
            res.status(400).json({
                message: "Order not found or already accepted",
            })
        }
        if (order) order.orderStatus = "preparing";

        ////yaha pe socket.io lagayenge future me

        await order?.save()

        return res.status(200).json({
            message: "Payment Confirmed & Order Accepted",
            order: order
        })
    } catch (error: any) {
        return res.status(500).json({ message: "Failed to accept order", error: error.message });
    }
}

const rejectOrder = async (req: Request, res: Response) => {
    try {
        const { orderId, reason } = req.body
        const vendorId = req.user?.vendorId

        const order = await Order.findOneAndUpdate(
            { _id: orderId, vendorId: vendorId },
            {
                orderStatus: "cancelled",
                rejectReason: reason,
            },
            { new: true }
        )

        if (!order) return res.status(404).json({ message: "Order not found" });

        return res.status(200).json({ message: "Order rejected successfully" });

    } catch (error: any) {
        return res.status(500).json({ message: "Failed to reject order", error: error.message });
    }
}

const updateOrderItemStatus = async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const { orderId, iId } = req.params;
        const vendorId = req.user?.vendorId;

        const order = await Order.findOne({ _id: orderId, vendorId: vendorId })

        if (!order) {
            return res.status(400).json({
                message: "Order not found",
            })
        }

        const item = order?.items.find(item => item._id.toString() === iId)

        if (!item) return res.status(404).json({ message: "Item not found" })

        item.status = status;

        const isAnyPending = order.items.some(i => i.status === "pending")

        if (isAnyPending) {
            //ye check krega ki agar koi item pending state me hai to us order ko preparing state me kar do  
            order.orderStatus = "preparing";
        } else {
            const isAllCancelled = order?.items.every(i => i.status === "cancelled")
            if (isAllCancelled) {
                order.orderStatus = "cancelled"
                order.rejectReason = "all items were cancelled"
            }
            else {
                order.orderStatus = "ready"
            }
        }

        await order?.save()

        return res.status(200).json({
            message: "Item status updated",
            orderStatus: order?.orderStatus
        });

    } catch (error: any) {
        return res.status(500).json({ message: "updateOrderItemStatus Failed", error: error.message });
    }
}

const completeOrder = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const vendorId = req.user?.vendorId

        const order = await Order.findOneAndUpdate(
            { _id: orderId, vendorId: vendorId, orderStatus: 'ready' },
            { orderStatus: "completed" },
            { new: true }
        )

        if (!order) return res.status(404).json({ message: "Order not ready or not found" })

        return res.status(200).json({
            message: "Order Completed",
            order: order,
        })
    } catch (error: any) {
        console.log("Original Error:", error)
        return res.status(500).json({ message: "completeOrder Failed", error: error.message || "Unknown Error" });
    }
}

const getVendorsOpenOrders = async (req: Request, res: Response) => {
    try {
        const vendorId = req.user?.vendorId
        const openOrders = await Order.find({ vendorId: vendorId, orderStatus: { $nin: ["completed", "cancelled", "created"] } }).sort({ createdAt: -1 })

        if (!openOrders || openOrders.length === 0) {
            return res.status(404).json({
                message: "No open order found",
            })
        }

        return res.status(200).json({
            message: "All Open Orders",
            orders: openOrders,
        })

    } catch (error: any) {
        return res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
}

const getVendorsRequestedOrders = async (req: Request, res: Response) => {
    try {
        const vendorId = req.user?.vendorId
        const openOrders = await Order.find({ vendorId: vendorId, orderStatus: { $in: ["created"] } }).sort({ createdAt: -1 })

        if (!openOrders || openOrders.length === 0) {
            return res.status(404).json({
                message: "No open order found",
            })
        }

        return res.status(200).json({
            message: "All requested Orders",
            orders: openOrders,
        })

    } catch (error: any) {
        return res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
}

const getVendorPastOrders = async (req: Request, res: Response) => {
    try {
        const vendorId = req.user?.vendorId;

        // query params
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || ""; // NAYA: Search query

        const skip = (page - 1) * limit;

        // Base filter
        const filter: any = {
            vendorId: vendorId,
            orderStatus: { $in: ["completed", "cancelled"] },
        };

        // NAYA: Agar search term aayi hai, toh Name, Phone ya TokenNo mein dhoondo
        if (search.trim() !== "") {
            filter.$or = [
                { "customerDetail.name": { $regex: search, $options: "i" } }, // 'i' for case-insensitive
                { "customerDetail.phone": { $regex: search, $options: "i" } },
                { tokenNo: { $regex: search, $options: "i" } }
            ];

            // Pro Tip: Agar tum tokenNo DB me save nahi karte aur _id ka use karte ho, 
            // toh MongoDB id ko string me convert karke search karne ke liye ye use hota hai:
            // { $expr: { $regexMatch: { input: { $toString: "$_id" }, regex: search, options: "i" } } }
        }

        const [orders, totalOrders] = await Promise.all([
            Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments(filter)
        ]);

        if (!orders || orders.length === 0) {
            return res.status(200).json({
                message: "No order Found",
                orders: [],
                totalOrders: 0,
                totalPage: 0,
                currentPage: page
            });
        }

        return res.status(200).json({
            message: "History fetched",
            orders,
            totalOrders,
            hasMore: (skip + orders.length) < totalOrders,
            totalPage: Math.ceil(totalOrders / limit),
            currentPage: page
        });
    } catch (error: any) {
        return res.status(500).json({ message: "Failed", error: error.message });
    }
}


const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const { orderId } = req.params;
        const vendorId = req.user?.vendorId;

        const order = await Order.findOne({
            _id: orderId,
            vendorId: vendorId,
        })

        if (!order) return res.status(404).json({ message: "Order not found or access denied" });

        return res.status(200).json({
            message: "Order details fetched",
            order
        });
    } catch (error: any) {
        return res.status(500).json({ message: "Server error", error: error.message });
    }
}

export {
    //customer
    placeOrder,
    getGuestOpenOrders,
    getCustomerOpenOrders,
    getCustomerPreviousOrder,
    //vendor
    acceptOrder,
    rejectOrder,
    updateOrderItemStatus,
    completeOrder,
    getVendorPastOrders,
    getVendorsOpenOrders,
    getVendorsRequestedOrders,
    getOrderDetails,
}