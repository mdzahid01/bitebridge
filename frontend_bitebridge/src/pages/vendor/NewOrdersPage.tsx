import { useEffect, useState } from 'react';
import axiosClient from '../../services/axiosClient';
import toast from 'react-hot-toast';
import { 
    ShoppingBag, 
    CheckCircle, 
    Clock, 
    User, 
    MapPin, 
    Phone, 
    Loader2, 
    AlertCircle, 
} from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

// --- Types ---
interface IOrderItem {
    _id: string;
    itemId: string;
    name: string;
    price: number;
    qty: number;
    status: string;
}

interface ICustomerDetail {
    name: string;
    phone: string;
    address: string;
}

interface IOrder {
    _id: string;
    tokenNo?: string;
    orderStatus: string;
    totalAmount: number;
    customerDetail: ICustomerDetail;
    items: IOrderItem[];
    createdAt: string;
}

const NewOrdersPage = () => {
    usePageTitle("New Orders");
    
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    
    // --- REJECT MODAL STATES ---
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejecting, setRejecting] = useState(false);

    // 1. Fetch New Orders (Backend is already sending only 'created' orders)
    const fetchNewOrders = async () => {
        try {
            // Tumhara naya endpoint jo filtered data bhejta hai
            const response = await axiosClient.get('/vendors/new-orders');
            
            // Seedha data set karo, no frontend filter needed
            setOrders(response.data.orders || []);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching orders:", err);
            setError(err.response?.data?.message || "Failed to load new orders");
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh every 30 seconds
    useEffect(() => {
        fetchNewOrders();
        const interval = setInterval(fetchNewOrders, 30000);
        return () => clearInterval(interval);
    }, []);

    // 2. Accept Order Handler
    const handleAcceptOrder = async (orderId: string) => {
        setAcceptingId(orderId);
        try {
            await axiosClient.patch('/vendors/accept-order', { orderId });
            toast.success("Order Accepted & sent to Kitchen!");
            
            // Order list se hata do
            setOrders(prev => prev.filter(order => order._id !== orderId));
        } catch (err: any) {
            console.error("Error accepting order:", err);
            toast.error(err.response?.data?.message || "Failed to accept order");
        } finally {
            setAcceptingId(null);
        }
    };

    // 3. Reject Order Handlers
    const openRejectModal = (orderId: string) => {
        setSelectedOrderId(orderId);
        setRejectReason(""); // Purana reason clear karo
        setIsRejectModalOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!rejectReason.trim()) {
            return toast.error("Please provide a reason for rejection");
        }

        setRejecting(true);
        try {
            await axiosClient.patch('/vendors/reject-order', { 
                orderId: selectedOrderId, 
                reason: rejectReason 
            });
            
            toast.success("Order Rejected");
            
            // Order list se hata do
            setOrders(prev => prev.filter(order => order._id !== selectedOrderId));
            setIsRejectModalOpen(false); // Modal close karo
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to reject order");
        } finally {
            setRejecting(false);
        }
    };

    // --- Loading State ---
    if (loading && orders.length === 0) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                    <p className="text-gray-500 font-medium">Checking for new orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <ShoppingBag className="text-orange-600" />
                        New Order Requests
                        {orders.length > 0 && (
                            <span className="bg-red-500 text-white text-sm px-2 py-0.5 rounded-full animate-pulse">
                                {orders.length} New
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Review and accept customer orders</p>
                </div>
                
                <button 
                    onClick={fetchNewOrders}
                    className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
                >
                    <Clock size={16} /> Refresh Now
                </button>
            </div>

            {/* --- Error Message --- */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* --- Empty State --- */}
            {orders.length === 0 && !error ? (
                <div className="flex flex-col items-center justify-center bg-white border border-dashed border-gray-300 rounded-2xl py-20 text-gray-400">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <CheckCircle size={48} className="text-green-500 opacity-50" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-700">All caught up!</h2>
                    <p className="text-gray-500">No new order requests at the moment.</p>
                </div>
            ) : (
                /* --- Orders Grid --- */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-20">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden relative group flex flex-col">
                            
                            {/* Accent line on top */}
                            <div className="h-1 w-full bg-orange-500"></div>
                            
                            <div className="p-5 flex-grow">
                                {/* Header: Token & Time */}
                                <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Token No.</p>
                                        <p className="text-2xl font-black text-gray-900 leading-none mt-1">
                                            #{order.tokenNo || order._id.slice(-4).toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="text-right flex flex-col items-end">
                                        <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded">
                                            Just Arrived
                                        </span>
                                        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <Clock size={12} />
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Customer Details */}
                                {order.customerDetail && (
                                    <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <User size={16} className="text-gray-400" />
                                            <span className="font-semibold">{order.customerDetail.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-700">
                                            <Phone size={16} className="text-gray-400" />
                                            <span>{order.customerDetail.phone}</span>
                                        </div>
                                        {order.customerDetail.address && (
                                            <div className="flex items-start gap-2 text-sm text-gray-700">
                                                <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                                <span className="line-clamp-2">{order.customerDetail.address}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Items List */}
                                <div className="mb-2">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Order Items ({order.items.length})</p>
                                    <ul className="space-y-2 overflow-y-auto max-h-40 pr-2">
                                        {order.items.map((item, idx) => (
                                            <li key={idx} className="flex justify-between items-start text-sm">
                                                <div className="flex gap-2 font-medium text-gray-800">
                                                    <span className="text-gray-400">{item.qty}x</span>
                                                    <span>{item.name}</span>
                                                </div>
                                                <span className="text-gray-500">₹{item.price * item.qty}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* --- TOTAL & ACTION BUTTONS --- */}
                            <div className="flex items-center justify-between border-t border-gray-100 p-4 mt-auto bg-gray-50">
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Total Bill</p>
                                    <p className="text-lg font-bold text-gray-900">₹{order.totalAmount}</p>
                                </div>
                                
                                <div className="flex gap-2">
                                    {/* Reject Button */}
                                    <button 
                                        onClick={() => openRejectModal(order._id)}
                                        disabled={acceptingId === order._id}
                                        className="p-2.5 rounded-lg font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors border border-red-200 disabled:opacity-50"
                                        title="Reject Order"
                                    >
                                        Reject
                                    </button>

                                    {/* Accept Button */}
                                    <button 
                                        onClick={() => handleAcceptOrder(order._id)}
                                        disabled={acceptingId === order._id}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-white transition-all active:scale-95 shadow-md ${
                                            acceptingId === order._id 
                                                ? 'bg-orange-400 cursor-not-allowed' 
                                                : 'bg-green-600 hover:bg-green-700'
                                        }`}
                                    >
                                        {acceptingId === order._id ? (
                                            <><Loader2 size={18} className="animate-spin" /> Accepting...</>
                                        ) : (
                                            <> Accept</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- REJECT REASON MODAL --- */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <AlertCircle className="text-red-500" />
                            Reject Order
                        </h2>
                        <p className="text-sm text-gray-500 mb-4">
                            Please provide a reason for rejecting this order. The customer will see this message.
                        </p>
                        
                        <textarea 
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g., Item out of stock, Shop is closing, Payment failed..."
                            className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-500 resize-none min-h-[100px]"
                            autoFocus
                        ></textarea>

                        <div className="flex gap-3 mt-6">
                            <button 
                                onClick={() => setIsRejectModalOpen(false)}
                                disabled={rejecting}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleRejectSubmit}
                                disabled={rejecting || !rejectReason.trim()}
                                className={`flex-1 px-4 py-2 rounded-lg font-medium text-white flex justify-center items-center gap-2 transition-all ${
                                    rejecting || !rejectReason.trim() 
                                        ? 'bg-red-400 cursor-not-allowed' 
                                        : 'bg-red-600 hover:bg-red-700 shadow-md active:scale-95'
                                }`}
                            >
                                {rejecting ? <><Loader2 size={18} className="animate-spin" /> Rejecting...</> : "Confirm Reject"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default NewOrdersPage;