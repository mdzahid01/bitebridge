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
    ShoppingBag
} from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

// --- Types ---
interface IOrderItem {
    _id: string;
    name: string;
    qty: number;
    price: number;
    status: string;
}

interface IOrder {
    _id: string;
    tokenNo?: string;
    orderStatus: 'created' | 'preparing' | 'ready';
    totalAmount: number;
    items: IOrderItem[];
    createdAt: string;
}

const MyOrdersPage = () => {
    usePageTitle("Track My Order");
    const { authUser } = useAuth();
    
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchLiveOrders = async () => {
        try {
            if (authUser) {
                // 🟢 LOGGED-IN CUSTOMER LOGIC
                // Apne backend route ke hisaab se URL adjust kar lena
                const response = await axiosClient.get('/customer-open-orders'); 
                setOrders(response.data.orders || []);
            } else {
                // 🟡 GUEST CUSTOMER LOGIC
                const guestOrderIds = JSON.parse(localStorage.getItem('guestOrders') || '[]');
                
                if (guestOrderIds.length > 0) {
                    // Apne backend route ke hisaab se URL adjust kar lena
                    const response = await axiosClient.post('/guest-open-orders', { 
                        orderIds: guestOrderIds 
                    });
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

    // --- Order Tracker Stepper Component ---
    const OrderTracker = ({ status }: { status: string }) => {
        // Map status to steps
        const steps = [
            { key: 'created', label: 'Order Placed', icon: <Clock size={20} /> },
            { key: 'preparing', label: 'In Kitchen', icon: <ChefHat size={20} /> },
            { key: 'ready', label: 'Ready!', icon: <CheckCircle size={20} /> },
        ];

        let currentStepIndex = steps.findIndex(s => s.key === status);
        if (currentStepIndex === -1) currentStepIndex = 0; 

        return (
            <div className="relative flex justify-between items-center w-full mt-6 mb-8 px-4">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>
                
                {/* Active Line (Green) */}
                <div 
                    className="absolute top-1/2 left-0 h-1.5 bg-green-500 -translate-y-1/2 z-0 transition-all duration-700 rounded-full"
                    style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {/* Step Icons */}
                {steps.map((step, idx) => {
                    const isActive = idx <= currentStepIndex;
                    const isCurrent = idx === currentStepIndex;
                    return (
                        <div key={step.key} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                                isActive 
                                    ? 'bg-green-500 text-white shadow-lg shadow-green-200' 
                                    : 'bg-white text-gray-300 border-4 border-gray-200'
                            } ${isCurrent ? 'ring-4 ring-green-100 scale-110' : ''}`}>
                                {step.icon}
                            </div>
                            <span className={`text-xs font-bold absolute -bottom-7 w-24 text-center ${
                                isActive ? 'text-green-700' : 'text-gray-400'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

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
                                
                                {/* Top Info */}
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
                                
                                {/* Tracker Stepper Component */}
                                <div className="py-6 bg-gray-50 rounded-xl border border-gray-100 mb-6">
                                    <OrderTracker status={order.orderStatus} />
                                </div>

                                {/* Order Status Messages */}
                                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                                    order.orderStatus === 'ready' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-orange-50 border-orange-200 text-orange-800'
                                }`}>
                                    <Store size={24} className="shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-bold">
                                            {order.orderStatus === 'created' && "Waiting for vendor to accept..."}
                                            {order.orderStatus === 'preparing' && "Your food is being prepared!"}
                                            {order.orderStatus === 'ready' && "Yay! Your order is ready!"}
                                        </p>
                                        <p className="text-sm mt-1 opacity-90">
                                            {order.orderStatus === 'created' && "The kitchen will review your order shortly."}
                                            {order.orderStatus === 'preparing' && "Our chefs are cooking your meal with love."}
                                            {order.orderStatus === 'ready' && "Please show your Token Number at the counter to collect your food."}
                                        </p>
                                    </div>
                                </div>

                                {/* Items Summary */}
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Order Details</p>
                                    <div className="space-y-2">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <div className="font-medium text-gray-700">
                                                    <span className="text-orange-600 mr-2">{item.qty}x</span>
                                                    {item.name}
                                                </div>
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