import { useEffect, useState } from 'react';
import axiosClient from '../../services/axiosClient';
import { useAuth } from '../../context/AuthContext';
import {
    History,
    CheckCircle,
    ShoppingBag,
    Loader2,
    XCircle
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
    orderStatus: 'completed' | 'cancelled';
    totalAmount: number;
    items: IOrderItem[];
    createdAt: string;
    rejectReason?: string;
}

const CustomerPreviousOrdersPage = () => {
    usePageTitle("Past Orders");
    const { authUser } = useAuth();

    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    const fetchPreviousOrders = async (pageNumber = 1) => {
        try {
            if (authUser) {
                const response = await axiosClient.get(`/shop/my-previous-orders?page=${pageNumber}&limit=10`);
                if (pageNumber === 1) {
                    setOrders(response.data.orders || []);
                } else {
                    setOrders(prev => [...prev, ...(response.data.orders || [])]);
                }
                setHasMore(response.data.hasMore);
            }
        } catch (error) {
            console.error("Error fetching previous orders:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPreviousOrders(1);
    }, [authUser]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPreviousOrders(nextPage);
    };

    if (loading && orders.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-4" />
                <p className="text-gray-500 font-medium">Fetching your order history...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-6">
            <div className="max-w-3xl mx-auto px-4">

                <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <History className="text-orange-600" />
                    Previous Orders
                </h1>

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <ShoppingBag size={64} className="mx-auto text-gray-200 mb-4" />
                        <h2 className="text-xl font-bold text-gray-700">No past orders</h2>
                        <p className="text-gray-500 mt-2">Looks like you haven't completed any orders yet!</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <div key={order._id} className="bg-white rounded-2xl shadow-sm border p-5 overflow-hidden">
                                
                                {/* Top Info: Status, Token & Total */}
                                <div className="flex justify-between items-start pb-4 border-b border-gray-100 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            {order.orderStatus === 'completed' ? (
                                                <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-100 uppercase tracking-wide">
                                                    <CheckCircle size={14} /> Completed
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-50 px-2 py-1 rounded border border-red-100 uppercase tracking-wide">
                                                    <XCircle size={14} /> Cancelled
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Token No.</p>
                                        <p className="text-2xl font-black text-gray-900 mt-1 tracking-tight">
                                            #{order.tokenNo || order._id.slice(-4).toUpperCase()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                                            ₹{order.totalAmount}
                                        </p>
                                        <p className="text-xs text-gray-500 font-medium mt-2">
                                            {new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>

                                {order.orderStatus === 'cancelled' && order.rejectReason && (
                                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-start gap-2 border border-red-100">
                                        <XCircle size={16} className="mt-0.5 shrink-0" />
                                        <span><strong>Reason:</strong> {order.rejectReason}</span>
                                    </div>
                                )}

                                {/* Items Summary */}
                                <div className="pt-2">
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">Items Ordered</p>
                                    
                                    <div className="space-y-3">
                                        {order.items.map((item, idx) => (
                                            <div key={item._id || idx} className="flex justify-between items-center text-sm">
                                                <div className={`text-gray-700 flex items-center font-medium ${item.status === 'cancelled' ? 'line-through opacity-60' : ''}`}>
                                                    <span className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-xs font-bold mr-3 border border-orange-100 no-underline">
                                                        {item.qty}x
                                                    </span>
                                                    {item.name}
                                                </div>
                                                <div className={`font-bold text-gray-600 ${item.status === 'cancelled' ? 'line-through opacity-60' : ''}`}>
                                                    ₹{item.price * item.qty}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        ))}

                        {hasMore && (
                            <div className="flex justify-center pt-2">
                                <button 
                                    onClick={loadMore}
                                    className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:text-orange-600 transition-colors shadow-sm w-full md:w-auto"
                                >
                                    Load More Past Orders
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerPreviousOrdersPage;
