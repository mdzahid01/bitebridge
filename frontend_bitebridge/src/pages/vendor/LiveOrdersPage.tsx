import { useEffect, useState,type ChangeEvent } from 'react';
import axiosClient from '../../services/axiosClient';
import toast from 'react-hot-toast';
import { 
    UtensilsCrossed, 
    CheckCircle, 
    Clock, 
    Loader2, 
    AlertCircle,
    User,
    Phone,
} from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

// --- Types ---
interface IOrderItem {
    _id: string; 
    itemId: string; 
    name: string;
    price: number;
    qty: number;
    status: "pending" | "ready" | "cancelled" | "delivered";
}

interface ICustomerDetail {
    name: string;
    phone: string;
}

interface IOrder {
    _id: string;
    tokenNo?: string;
    orderStatus: string;
    totalAmount: number;
    customerDetail: ICustomerDetail; // Added Customer Details
    items: IOrderItem[];
    createdAt: string;
}

const LiveOrdersPage = () => {
    usePageTitle("Kitchen - Live Orders");
    
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingItem, setUpdatingItem] = useState<string | null>(null);
    const [completingOrder, setCompletingOrder] = useState<string | null>(null);

    // 1. Fetch Live Orders
    const fetchLiveOrders = async () => {
        try {
            const response = await axiosClient.get('/vendors/open-orders');
            // 'preparing' ya 'ready' status wale orders
            const kitchenOrders = response.data.orders|| [];
            
            setOrders(kitchenOrders);
            setError(null);
        } catch (err: any) {
            console.error("Error fetching live orders:", err);
            setError(err.response?.data?.message || "Failed to load kitchen orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLiveOrders();
        const interval = setInterval(fetchLiveOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    // 2. Dropdown Update Handler
    const handleItemStatusUpdate = async (orderId: string, itemId: string, newStatus: string) => {
        setUpdatingItem(itemId);
        
        try {
            await axiosClient.patch(`/vendors/${orderId}/items/${itemId}`, { status: newStatus });
            
            // Local state update
            setOrders(prevOrders => 
                prevOrders.map(order => {
                    if (order._id === orderId) {
                        return {
                            ...order,
                            items: order.items.map(item => 
                                item._id === itemId ? { ...item, status: newStatus as any } : item
                            )
                        };
                    }
                    return order;
                })
            );
            toast.success(`Item marked as ${newStatus}`);
        } catch (err: any) {
            console.error("Error updating item:", err);
            toast.error("Failed to update item status");
            // Revert fetch on error
            fetchLiveOrders(); 
        } finally {
            setUpdatingItem(null);
        }
    };

    // 3. Complete Order
    const handleCompleteOrder = async (orderId: string) => {
        setCompletingOrder(orderId);
        try {
            await axiosClient.patch(`/vendors/${orderId}/complete`);
            toast.success("Order Completed & Delivered!");
            setOrders(prev => prev.filter(order => order._id !== orderId));
        } catch (err: any) {
            console.error("Error completing order:", err);
            toast.error(err.response?.data?.message || "Failed to complete order");
        } finally {
            setCompletingOrder(null);
        }
    };

    // --- Helpers ---
    // Order complete tabhi hoga saare item 'delivered' ya "cancelled"  ho
    const isOrderReadyToComplete = (items: IOrderItem[]) => {
        return items.every(item => item.status === 'delivered' || item.status === 'cancelled');
    };

    // Dynamic Color for Select Dropdown
    const getStatusStyles = (status: string) => {
        switch(status) {
            case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200 focus:ring-orange-500';
            case 'ready': return 'bg-green-100 text-green-700 border-green-200 focus:ring-green-500';
            case 'delivered': return 'bg-blue-100 text-blue-700 border-blue-200 focus:ring-blue-500';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200 line-through focus:ring-red-500';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    // --- Render ---
    if (loading && orders.length === 0) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <UtensilsCrossed className="text-orange-600" />
                        Live Orders
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage preparation and delivery</p>
                </div>
                <button onClick={fetchLiveOrders} className="text-gray-500 hover:text-orange-600 bg-white p-2 rounded-lg border shadow-sm">
                    <Clock size={20} />
                </button>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 border border-red-200">
                    <AlertCircle size={20} /> <span>{error}</span>
                </div>
            )}

            {orders.length === 0 && !error ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                    <CheckCircle size={48} className="text-green-400 mb-4 opacity-50" />
                    <h2 className="text-xl font-bold text-gray-700">Kitchen is clear!</h2>
                    <p>No active orders right now.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-20">
                    {orders.map((order) => {
                        const canComplete = isOrderReadyToComplete(order.items);
                        
                        return (
                            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                                
                                {/* 1. Dark Header (Token & Time) */}
                                <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
                                    <div>
                                        <p className="text-xs opacity-70 uppercase tracking-wider">Token</p>
                                        <p className="text-2xl font-bold leading-none mt-1">
                                            #{order.tokenNo || order._id.slice(-4).toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="text-right flex items-center gap-1 opacity-90">
                                        <Clock size={14} />
                                        <p className="text-sm font-medium">
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                {/* 2. Customer Details Section */}
                                {order.customerDetail && (
                                    <div className="bg-orange-50/50 p-4 border-b border-gray-100 space-y-2">
                                        <div className="flex items-center gap-2 text-sm text-gray-800 font-medium">
                                            <User size={16} className="text-orange-600" />
                                            <span>{order.customerDetail.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Phone size={16} className="text-orange-600" />
                                            <span>{order.customerDetail.phone}</span>
                                        </div>
                                    </div>
                                )}

                                {/* 3. Items List with Dropdowns */}
                                <div className="p-4 flex-grow">
                                    <ul className="space-y-2 overflow-y-auto max-h-60 pr-2">
                                        {order.items.map((item) => (
                                            <li key={item._id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                
                                                {/* Left: Qty + Name */}
                                                <div className="flex items-center gap-3 w-1/2">
                                                    <span className="font-extrabold text-lg text-gray-900">{item.qty}x</span>
                                                    <span className={`font-medium truncate ${item.status === 'cancelled' ? 'line-through text-gray-400' : 'text-gray-800'}`} title={item.name}>
                                                        {item.name}
                                                    </span>
                                                </div>
                                                
                                                {/* Right: Smart Dropdown */}
                                                <div className="relative w-[110px] shrink-0">
                                                    {updatingItem === item._id ? (
                                                        <div className="flex justify-center py-2">
                                                            <Loader2 size={20} className="animate-spin text-orange-600" />
                                                        </div>
                                                    ) : (
                                                        <select
                                                            value={item.status}
                                                            onChange={(e: ChangeEvent<HTMLSelectElement>) => handleItemStatusUpdate(order._id, item._id, e.target.value)}
                                                            className={`w-full text-xs font-bold uppercase tracking-wider py-2 px-2 pr-6 rounded-md border appearance-none cursor-pointer outline-none transition-colors ${getStatusStyles(item.status)}`}
                                                        >
                                                            <option value="pending" className="bg-white text-gray-800 font-medium">Pending</option>
                                                            <option value="ready" className="bg-white text-gray-800 font-medium">Ready</option>
                                                            <option value="delivered" className="bg-white text-gray-800 font-medium">Delivered</option>
                                                            <option value="cancelled" className="bg-white text-gray-800 font-medium">Cancelled</option>
                                                        </select>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* 4. Complete Order Button */}
                                <div className="p-4 border-t border-gray-100 bg-gray-50 mt-auto">
                                    <button 
                                        onClick={() => handleCompleteOrder(order._id)}
                                        disabled={completingOrder === order._id || !canComplete}
                                        className={`w-full py-3.5 rounded-lg font-bold transition-all flex justify-center items-center gap-2 ${
                                            !canComplete 
                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                                                : completingOrder === order._id
                                                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                                    : 'bg-green-600 hover:bg-green-700 text-white shadow-md active:scale-95'
                                        }`}
                                    >
                                        {completingOrder === order._id ? (
                                            <><Loader2 size={20} className="animate-spin" /> Finalizing...</>
                                        ) : (
                                            <><CheckCircle size={20} /> Complete Order</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default LiveOrdersPage;