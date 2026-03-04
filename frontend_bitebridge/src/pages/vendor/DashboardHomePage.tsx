import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../services/axiosClient';
import toast from 'react-hot-toast';
import { 
    Store, 
    Power, 
    TrendingUp, 
    ShoppingBag, 
    Clock,
    Loader2
} from 'lucide-react';

const DashboardHomePage = () => {
    const { authUser } = useAuth();
    
    // Status states
    const [isShopOpen, setIsShopOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [fetching, setFetching] = useState<boolean>(true);

    // Initial load pe dukan ka status backend se check karenge
    useEffect(() => {
        const fetchShopStatus = async () => {
            try {
                // Apne backend ke hisaab se route adjust kar lena (e.g., /vendor/profile ya /vendor/status)
                const response = await axiosClient.get('/vendors/get-shop-status'); 
                setIsShopOpen(response.data.isOpen); 
            } catch (error) {
                console.error("Failed to fetch shop status", error);
            } finally {
                setFetching(false);
            }
        };

        fetchShopStatus();
    }, []);

    // Toggle button ka logic
    // Toggle button ka logic
    const handleToggleStatus = async () => {
        setLoading(true);
        const newStatus = !isShopOpen; // Current status ka ulta (True -> False ya False -> True)

        try {

            const response = await axiosClient.patch('/vendors/toggle-shop', {
                isOpen: newStatus
            });

            // Backend ne jo update karke bheja hai, wahi set karo ekdum accurate data ke liye
            setIsShopOpen(response.data.vendor.isOpen);

            // Backend se aane wala success message direct toast me dikha rahe hain
            if (newStatus) {
                toast.success(response.data.message, {
                    position: "bottom-center",
                    style: { background: '#10B981', color: '#fff', fontWeight: 'bold' }
                });
            } else {
                toast.error(response.data.message, {
                    position: "bottom-center",
                    style: { background: '#EF4444', color: '#fff', fontWeight: 'bold' }
                });
            }

        } catch (error: any) {
            // Controller ke error messages handle ho jayenge (jaise "Invalid Input" ya "Vendor Not Found")
            toast.error(error.response?.data?.message || "Failed to update status", {
                position: "bottom-center"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-6xl mx-auto space-y-6">
            
            {/* Header Section */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 capitalize">
                    Welcome back, {authUser?.name || 'Vendor'}! 👋
                </h1>
                <p className="text-gray-500 mt-1">Here is what's happening at your store today.</p>
            </div>

            {/* --- Main Shop Status Card --- */}
            {authUser?.role==="vendorOwner" &&(
                 <div className={`p-6 md:p-8 rounded-2xl shadow-sm border transition-colors flex flex-col md:flex-row items-center justify-between gap-6 ${
                isShopOpen ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
                <div className="flex items-center gap-4 text-center md:text-left">
                    <div className={`p-4 rounded-full ${isShopOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <Store size={32} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Shop Status</h2>
                        <p className={`font-medium mt-1 ${isShopOpen ? 'text-green-600' : 'text-red-600'}`}>
                            {fetching ? 'Checking status...' : (isShopOpen ? 'Currently Accepting Orders' : 'Currently Closed')}
                        </p>
                    </div>
                </div>

                {/* The Custom Tailwind Toggle Switch */}
                <button
                    onClick={handleToggleStatus}
                    disabled={loading || fetching}
                    className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2 disabled:opacity-50 ${
                        isShopOpen ? 'bg-green-500 focus:ring-green-100' : 'bg-gray-400 focus:ring-gray-100'
                    }`}
                >
                    <span className="sr-only">Toggle Shop Status</span>
                    {/* The Circle inside Toggle */}
                    <span
                        className={` h-8 w-8 transform rounded-full bg-white shadow-md transition-transform flex items-center justify-center ${
                            isShopOpen ? 'translate-x-11' : 'translate-x-1'
                        }`}
                    >
                        {loading ? (
                            <Loader2 size={16} className="animate-spin text-gray-400" />
                        ) : (
                            <Power size={16} className={`${isShopOpen ? "text-green-500" : "text-gray-400"}` } />
                        )}
                    </span>
                </button>
            </div>
            )}
           

            {/* --- Dummy Quick Stats (Taki dashboard premium lage) --- */}
            <h3 className="text-lg font-bold text-gray-700 mt-8 mb-4">Quick Insights (Today)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className="bg-orange-100 p-3 rounded-lg text-orange-600">
                        <ShoppingBag size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">New Orders</p>
                        <p className="text-2xl font-bold text-gray-800">14</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                        <p className="text-2xl font-bold text-gray-800">₹4,250</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Avg. Prep Time</p>
                        <p className="text-2xl font-bold text-gray-800">12 Min</p>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default DashboardHomePage;