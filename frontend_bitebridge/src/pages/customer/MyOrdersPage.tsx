import { useEffect, useState } from 'react';
import axiosClient from '../../services/axiosClient';
import { useAuth } from '../../context/AuthContext';
import {
    Clock,
    ChefHat,
    CheckCircle,
    Package,
    Loader2,
    Store,
    ShoppingBag,
    XCircle,
    CheckCheck
} from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

// --- Types ---
interface IOrderItem {
    _id: string;
    name: string;
    qty: number;
    price: number;
    status: string; // 'pending', 'preparing', 'ready'
}

interface IOrder {
    _id: string;
    tokenNo?: string;
    orderStatus: 'created' | 'preparing' | 'ready';
    totalAmount: number;
    items: IOrderItem[];
    createdAt: string;
}

// --- Item Tracker Component ---
// ✅ NAYA: orderStatus prop add kiya
const ItemTracker = ({ status, orderStatus }: { status: string, orderStatus: string }) => {

    if (status === 'cancelled' || status === 'rejected') {
        return (
            <div className="flex items-center justify-center gap-2 py-3 mt-4 bg-red-50 rounded-lg border border-red-200 text-red-600">
                <XCircle size={18} />
                <span className="font-bold text-sm">Item Cancelled</span>
            </div>
        );
    }

    const steps = [
        { key: 'pending', label: 'Received', icon: <Clock size={16} /> },
        { key: 'preparing', label: 'Cooking', icon: <ChefHat size={16} /> },
        { key: 'ready', label: 'Ready', icon: <CheckCircle size={16} /> },
        { key: 'delivered', label: 'Collected', icon: <CheckCheck size={16} /> },
    ];

    // 🔥 SMART LOGIC: Agar vendor ne order accept kar liya hai ('preparing'), 
    // par item abhi bhi 'pending' hai, toh usko 'Cooking' ('preparing') maan lo.
    let derivedStatus = status;
    if (status === 'pending' && orderStatus === 'preparing') {
        derivedStatus = 'preparing';
    } else if (status === 'completed') {
        derivedStatus = 'delivered'; // Safety fallback
    }

    let currentStepIndex = steps.findIndex(s => s.key === derivedStatus);
    if (currentStepIndex === -1) currentStepIndex = 0;

    return (
        <div className="relative flex justify-between items-center w-full mt-4 mb-6 px-2">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>

            <div
                className="absolute top-1/2 left-0 h-1 bg-orange-400 -translate-y-1/2 z-0 transition-all duration-700 rounded-full"
                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            ></div>

            {steps.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                let activeColor = 'bg-orange-500 text-white shadow-md ring-orange-200';
                if (isActive && step.key === 'delivered') activeColor = 'bg-green-500 text-white shadow-md ring-green-200';

                return (
                    <div key={step.key} className="relative z-10 flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${isActive ? activeColor : 'bg-white text-gray-300 border-2 border-gray-200'
                            } ${isCurrent ? 'ring-4 scale-110' : ''}`}>
                            {step.icon}
                        </div>
                        <span className={`text-[10px] font-bold absolute -bottom-5 w-16 text-center ${isActive ? (step.key === 'delivered' ? 'text-green-700' : 'text-orange-700') : 'text-gray-400'
                            }`}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

const MyOrdersPage = () => {
    usePageTitle("Track My Order");
    const { authUser } = useAuth();

    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchLiveOrders = async () => {
        try {
            if (authUser) {
                const response = await axiosClient.get('/shop/customer-open-orders');
                setOrders(response.data.orders || []);
            } else {
                // GUEST CUSTOMER LOGIC
                const orderIds = JSON.parse(localStorage.getItem('guestOrders') || '[]');

                if (orderIds.length > 0) {
                    const response = await axiosClient.post('/shop/guest-open-orders', { orderIds });
                    setOrders(response.data.orders || []);
                } else {
                    setOrders([]); // Koi guest order nahi hai
                }
            }
        } catch (error) {
            console.error("Error fetching live orders:", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh har 15 second mein taaki live status update hota rahe
    useEffect(() => {
        fetchLiveOrders();
        const interval = setInterval(fetchLiveOrders, 15000);
        return () => clearInterval(interval);
    }, [authUser]);

    if (loading && orders.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-4" />
                <p className="text-gray-500 font-medium">Fetching your order status...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-6">
            <div className="max-w-3xl mx-auto px-4">

                <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Package className="text-orange-600" />
                    Live Order Tracking
                </h1>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
                        <h2 className="text-xl font-bold text-gray-700">No active orders</h2>
                        <p className="text-gray-500 mt-2">Looks like you haven't placed any orders yet, or they are completed!</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white rounded-2xl shadow-md border-t-4 border-orange-500 p-5 overflow-hidden">

                                {/* Top Info: Token & Total */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Token No.</p>
                                        <p className="text-4xl font-black text-gray-900 mt-1 tracking-tight">
                                            #{order.tokenNo || order._id.slice(-4).toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-800 bg-orange-50 px-3 py-1 rounded-lg text-orange-700 border border-orange-100">
                                            ₹{order.totalAmount}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2 flex items-center justify-end gap-1">
                                            <Clock size={12} />
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Order Main Status Message */}
                                <div className="p-4 mb-6 rounded-xl border flex items-start gap-3 bg-gray-50 border-gray-200 text-gray-800">
                                    <Store size={24} className="shrink-0 mt-0.5 text-orange-500" />
                                    <div>
                                        <p className="font-bold">
                                            {order.orderStatus === 'created' && "Waiting for vendor to accept..."}
                                            {order.orderStatus === 'preparing' && "Kitchen is preparing your items!"}
                                            {order.orderStatus === 'ready' && "All items are ready to collect!"}
                                        </p>
                                        <p className="text-sm mt-1 opacity-80">
                                            Track individual items below. Show your Token Number at the counter.
                                        </p>
                                    </div>
                                </div>

                                {/* Items Summary with Individual Trackers */}
                                <div className="pt-2">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-4">Items in this order</p>

                                    <div className="space-y-4">
                                        {order.items.map((item, idx) => (
                                            <div key={item._id || idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm ring-1 ring-gray-50">

                                                {/* Item Header */}
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="font-bold text-gray-800 text-sm flex items-center">
                                                        <span className="text-orange-700 bg-orange-100 px-2 py-0.5 rounded mr-3">
                                                            {item.qty}x
                                                        </span>
                                                        {item.name}
                                                    </div>
                                                    <div className="font-bold text-gray-700 text-sm">
                                                        ₹{item.price * item.qty}
                                                    </div>
                                                </div>

                                                {/* Individual Item Tracker */}
                                                <ItemTracker
                                                    status={item.status || 'pending'}
                                                    orderStatus={order.orderStatus}
                                                />

                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrdersPage;