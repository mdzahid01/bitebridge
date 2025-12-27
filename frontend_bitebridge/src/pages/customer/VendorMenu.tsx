import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Star, Search, ShoppingBag, Plus, Minus } from 'lucide-react';
import LoadingSpinner from '../../components/layout/LoadingSpinner';
import { useCart } from '../../context/CartContext';
// import FloatingCart from '../../components/cart/FloatingCart';
import axiosClient from '../../services/axiosClient';


// 1. Category ka Structure
interface ICategory {
    _id: string;
    name: string;
}

// 2. Menu Item (Product) ka Structure
interface IProduct {
    _id: string;
    name: string;
    price: number;
    availability: boolean;
    fullImageUrl?: string; // Virtual field from backend
    description?: string;
    // Backend ne transform kiya tha: categoryId -> category object ban gaya hai
    category: ICategory;
}

// 3. Vendor ka Structure
interface IVendor {
    _id: string;
    shopName: string;
    slug: string;
    address: string;
    fullImageUrl?: string; // Virtual field
    isOpen: boolean;
    rating?: number; // Optional, agar backend se abhi nahi aa rha to
}

// 4. API Response ka Structure
interface ShopApiResponse {
    message: string;
    vendor: IVendor;
    categories: ICategory[];
    products: IProduct[];
}

const VendorMenu = () => {
    // URL Params ko type safe kiya
    const { slug } = useParams<{ slug: string }>();
    const { addToCart, decreaseQuantity, cartItems } = useCart()

    // State Types Define kiye
    const [vendor, setVendor] = useState<IVendor | null>(null);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [allItems, setAllItems] = useState<IProduct[]>([]);
    const [filteredItems, setFilteredItems] = useState<IProduct[]>([]);

    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchShopData = async () => {
            try {
                if (!slug) return;

                // Axios Response ko Type kiya <ShopApiResponse> ke sath
                const response = await axiosClient.get<ShopApiResponse>(`/shop/get-menu/${slug}`);

                const { vendor, categories, products } = response.data;

                setVendor(vendor);
                setCategories(categories);
                setAllItems(products);
                setFilteredItems(products);
            } catch (err: any) {
                console.error("Error fetching menu:", err);
                setError("Shop not found or server error");
            } finally {
                setLoading(false);
            }
        };

        fetchShopData();
    }, [slug]);

    // Handle Category Click (Type: string)
    const handleCategoryClick = (catId: string) => {
        setSelectedCategory(catId);
        if (catId === "all") {
            setFilteredItems(allItems);
        } else {
            // Optional chaining (?.) zaroori hai incase category null ho
            const filtered = allItems.filter((item) => item.category?._id === catId);
            setFilteredItems(filtered);
        }
    };

    if (loading) return <LoadingSpinner />;

    if (error || !vendor) return (
        <div className="flex flex-col items-center justify-center h-screen text-gray-500">
            <h2 className="text-2xl font-bold mb-2">Oops!</h2>
            <p>{error || "Vendor not found"}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            {/* --- HERO SECTION --- */}
            <div className="relative h-64 bg-gray-900">
                <img
                    src={vendor.fullImageUrl || "https://via.placeholder.com/800x400?text=Shop+Image"}
                    alt={vendor.shopName}
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                    <h1 className="text-3xl font-bold mb-1">{vendor.shopName}</h1>
                    <p className="flex items-center text-gray-300 text-sm mb-2">
                        <MapPin size={16} className="mr-1" /> {vendor.address}
                    </p>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${vendor.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                            {vendor.isOpen ? "OPEN NOW" : "CLOSED"}
                        </span>
                        <span className="flex items-center bg-orange-500 px-2 py-1 rounded text-xs font-bold">
                            <Star size={12} className="mr-1 fill-white" /> 4.5
                        </span>
                    </div>
                </div>
            </div>

            {/* --- CATEGORY FILTER --- */}
            <div className="sticky top-0 z-30 bg-white shadow-sm py-3 px-4 flex gap-3 overflow-x-auto no-scrollbar">
                <button
                    onClick={() => handleCategoryClick("all")}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === "all"
                            ? "bg-gray-900 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                >
                    All Items
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat._id}
                        onClick={() => handleCategoryClick(cat._id)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat._id
                                ? "bg-gray-900 text-white shadow-md"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* --- MENU ITEMS GRID --- */}
            <div className="container mx-auto px-4 py-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">
                    {selectedCategory === 'all' ? 'Full Menu' : 'Recommended for you'}
                </h2>

                {filteredItems.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p>No items found in this category.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => {
                            // 1. Check karo ki ye item cart mein hai ya nahi
                            const cartItem = cartItems.find((cartItem) => cartItem._id === item._id);

                            return (
                                <div key={item._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100 flex flex-row sm:flex-col h-32 sm:h-auto">

                                    {/* Image Section */}
                                    <div className="w-1/3 sm:w-full sm:h-48 relative shrink-0">
                                        <img
                                            src={item.fullImageUrl || "https://via.placeholder.com/300?text=Food"}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                                            {item.category?.name || "General"}
                                        </span>
                                    </div>

                                    {/* Content Section */}
                                    <div className="w-2/3 sm:w-full p-4 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-800 text-lg leading-tight mb-1">{item.name}</h3>
                                            <p className="text-gray-500 text-xs line-clamp-2 mb-2">Delicious and freshly prepared.</p>
                                        </div>

                                        {/* --- PRICE & BUTTON SECTION --- */}
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-lg font-bold text-gray-900">₹{item.price}</span>

                                            {vendor.isOpen ? (
                                                // Logic: Agar Cart mein hai to Counter, nahi to ADD button
                                                cartItem ? (
                                                    <div className="flex items-center bg-white border border-orange-200 rounded-lg shadow-sm">
                                                        {/* Minus Button */}
                                                        <button
                                                            onClick={() => {console.log("clicked");decreaseQuantity(item._id)}}
                                                            className="px-3 py-1 text-orange-600 hover:bg-orange-50 active:bg-orange-100 transition rounded-l-lg"
                                                        >
                                                            -
                                                        </button>

                                                        {/* Quantity Display */}
                                                        <span className="px-2 text-sm font-bold text-orange-700 w-6 text-center">
                                                            {cartItem.quantity}
                                                        </span>

                                                        {/* Plus Button */}
                                                        <button
                                                            onClick={() => addToCart({ ...item, vendorId: vendor._id })}
                                                            className="px-3 py-1 text-orange-600 hover:bg-orange-50 active:bg-orange-100 transition rounded-r-lg"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    // Add Button
                                                    <button
                                                        className="bg-orange-100 text-orange-600 hover:bg-orange-600 hover:text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95"
                                                        onClick={() => addToCart({ ...item, vendorId: vendor._id })}
                                                    >
                                                        ADD
                                                    </button>
                                                )
                                            ) : (
                                                // Closed Status
                                                <span className="text-xs font-bold text-gray-400 border border-gray-200 px-2 py-1 rounded select-none">
                                                    Closed
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {/* <FloatingCart /> */}
        </div>
    );
};

export default VendorMenu;