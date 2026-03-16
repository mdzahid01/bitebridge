import { useEffect, useState } from 'react';
import axiosClient from '../../services/axiosClient';
import { 
    History, CheckCircle, XCircle, Clock, User, Phone, MapPin, 
    Loader2, AlertCircle, ChevronLeft, ChevronRight, SearchX, Search
} from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';

// --- Types ---
interface IOrderItem {
    _id: string;
    name: string;
    price: number;
    qty: number;
    status: string;
}
interface ICustomerDetail {
    name: string;
    phone: string;
    address?: string;
}
interface IOrder {
    _id: string;
    tokenNo?: string;
    orderStatus: string; 
    totalAmount: number;
    customerDetail: ICustomerDetail;
    items: IOrderItem[];
    createdAt: string;
    rejectReason?: string;
}

const PreviousOrdersPage = () => {
    usePageTitle("Order History");

    const [orders, setOrders] = useState<IOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // --- Search States ---
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [debouncedSearch, setDebouncedSearch] = useState<string>("");

    // --- Pagination States ---
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [totalOrders, setTotalOrders] = useState<number>(0);

    const limit = 5; 

    // Debounce Logic (Wait 500ms before triggering search API)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setCurrentPage(1); // Naya search ho toh page 1 par wapas aao
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch API
    const fetchHistory = async (page: number, search: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosClient.get('/vendors/previous-orders', {
                params: {
                    page: page,
                    limit: limit,
                    search: search // Backend ko search bhej rahe hain
                }
            });

            setOrders(response.data.orders || []);
            setTotalPages(response.data.totalPage || 1);
            setTotalOrders(response.data.totalOrders || 0);
            
        } catch (err: any) {
            console.error("Error fetching history:", err);
            setError(err.response?.data?.message || "Failed to load order history");
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    // Jab bhi currentPage ya debouncedSearch change ho, API call karo
    useEffect(() => {
        fetchHistory(currentPage, debouncedSearch);
    }, [currentPage, debouncedSearch]);

    // Pagination Handlers
    const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(prev => prev + 1); };
    const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(prev => prev - 1); };

    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'completed') {
            return (
                <span className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <CheckCircle size={14} /> Completed
                </span>
            );
        }
        if (status === 'cancelled') {
            return (
                <span className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    <XCircle size={14} /> Cancelled
                </span>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col">
            
            {/* --- Header Section with Search Bar --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <History className="text-orange-600" />
                        Order History
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        View past completed and cancelled orders 
                        {totalOrders > 0 && <span className="font-semibold text-gray-700"> ({totalOrders} total)</span>}
                    </p>
                </div>

                {/* SEARCH INPUT */}
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search Name, Phone or Token..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    />
                    {searchTerm && (
                        <button 
                            onClick={() => setSearchTerm('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                        >
                            <XCircle size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* --- Error Message --- */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {/* --- Content Area --- */}
            {loading ? (
                <div className="flex-grow flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                        <p className="text-gray-500 font-medium">Loading history...</p>
                    </div>
                </div>
            ) : orders.length === 0 && !error ? (
                <div className="flex-grow flex flex-col items-center justify-center bg-white border border-dashed border-gray-300 rounded-2xl py-20 text-gray-400">
                    <div className="bg-gray-50 p-4 rounded-full mb-4">
                        <SearchX size={48} className="text-gray-300" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-700">No Orders Found</h2>
                    <p className="text-gray-500">
                        {debouncedSearch ? "Try searching with a different keyword." : "Your completed and cancelled orders will appear here."}
                    </p>
                </div>
            ) : (
                <>
                    {/* --- Orders Grid (Wahi purana) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8 flex-grow">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative flex flex-col">
                                
                                <div className={`h-1 w-full ${order.orderStatus === 'completed' ? 'bg-green-500' : 'bg-red-500'}`}></div>

                                <div className="p-5 flex-grow">
                                    {/* Order Header */}
                                    <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                                        <div>
                                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Token No.</p>
                                            <p className="text-2xl font-black text-gray-900 leading-none mt-1">
                                                #{order.tokenNo || order._id.slice(-4).toUpperCase()}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                                <Clock size={12} />
                                                {new Date(order.createdAt).toLocaleString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status={order.orderStatus} />
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    {order.customerDetail && (
                                        <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1.5 border border-gray-100">
                                            <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                                                <User size={14} className="text-gray-400" />
                                                <span>{order.customerDetail.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone size={14} className="text-gray-400" />
                                                <span>{order.customerDetail.phone}</span>
                                            </div>
                                            {order.customerDetail.address && (
                                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                                    <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                                                    <span className="line-clamp-1">{order.customerDetail.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Reject Reason */}
                                    {order.orderStatus === 'cancelled' && order.rejectReason && (
                                        <div className="mb-4 bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100 flex items-start gap-2">
                                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                            <div>
                                                <span className="font-bold block text-xs uppercase mb-0.5">Reason for Cancellation</span>
                                                <span>{order.rejectReason}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Items Summary */}
                                    <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">Order Items ({order.items.length})</p>
                                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-start text-sm">
                                                    <div className={`flex gap-2 font-medium text-gray-800 ${item.status === 'cancelled' ? 'opacity-60' : ''}`}>
                                                        <span className="text-gray-400">{item.qty}x</span>
                                                        <span className={item.status === 'cancelled' ? 'line-through text-gray-400' : ''}>
                                                            {item.name}
                                                        </span>
                                                    </div>
                                                    <span className={`text-gray-500 ${item.status === 'cancelled' ? 'line-through opacity-60' : ''}`}>
                                                        ₹{item.price * item.qty}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer (Total) */}
                                <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center mt-auto">
                                    <span className="text-gray-500 font-medium text-sm">Total Amount</span>
                                    <span className={`text-xl font-bold ${order.orderStatus === 'cancelled' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                        ₹{order.totalAmount}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* --- Pagination Controls --- */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-200 mt-auto">
                            <button 
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>
                            
                            <span className="text-sm font-medium text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                                Page {currentPage} of {totalPages}
                            </span>
                            
                            <button 
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PreviousOrdersPage;