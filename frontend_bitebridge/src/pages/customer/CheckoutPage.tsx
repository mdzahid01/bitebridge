import { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, User, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import axiosClient from "../../services/axiosClient";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cartItems, getCartTotal, decreaseQuantity, addToCart, clearCart } = useCart();
  const { authUser } = useAuth();

  // --- SIMPLE CALCULATION ---
  const grandTotal = getCartTotal();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  // Prefill Data
  useEffect(() => {
    if (authUser) {
      setFormData((prev) => ({
        ...prev,
        name: authUser.name,
        phone: authUser.phone,
      }));
    }
  }, [authUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return toast.error("Your cart is empty!");
    if (!formData.name || !formData.phone) {
      return toast.error("Please fill all details");
    }

    const orderPayload = {
      vendorId: cartItems[0].vendorId,
      items: cartItems.map(item => ({
        itemId: item._id,
        name: item.name,
        price: item.price,
        qty: item.quantity
      })),
      customerDetails: {
        name: formData.name,
        phone: formData.phone,
      }
    };

    console.log("Order Data:", orderPayload);
    try {
      const response = await axiosClient.post('/shop/place-order', orderPayload)
      
      if(!authUser){
        const newOrderId = response.data.orderId;
        const existingGuestOrders = JSON.parse(localStorage.getItem('guestOrders') || '[]')
        existingGuestOrders.push(newOrderId);
        localStorage.setItem('guestOrders',JSON.stringify(existingGuestOrders))
      }

      toast.success("Order Placed Successfully!");
      clearCart();
      navigate('/my-current-orders');

    } catch (error: any) {
      console.log("kuch to gadbad hua hai laadle...")
      toast.error(error.response?.data?.message || "dikkat to hui hai")
    }

  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <ShoppingBag size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800">Your Cart is Empty</h2>
        <button onClick={() => navigate(-1)} className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-full font-bold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">

      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-10 p-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Checkout</h1>
      </div>

      <div className="container mx-auto max-w-2xl p-4 flex flex-col gap-6">

        {/* --- ORDER SUMMARY  --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 flex justify-between">
            <span>Your Order</span>
            <span className="text-sm text-gray-500">{cartItems.length} items</span>
          </h2>

          <div className="flex flex-col gap-4">
            {cartItems.map((item) => (
              <div key={item._id} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">

                {/* Left Side: Image + Details */}
                <div className="flex items-center gap-3">
                  {/* IMAGE BOX */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-200">
                    <img
                      src={item.image || "https://via.placeholder.com/150?text=Food"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Text Details */}
                  <div>
                    <p className="font-bold text-gray-800 text-sm line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500 font-medium">₹{item.price} X {item.quantity} = {item.price * item.quantity}</p>
                  </div>
                </div>

                {/* Right Side: Counter */}
                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 h-8 shadow-sm">
                  <button onClick={() => decreaseQuantity(item._id)} className="px-3 text-orange-600 font-bold hover:bg-gray-200 h-full rounded-l-lg">-</button>
                  <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => addToCart(item)} className="px-3 text-orange-600 font-bold hover:bg-gray-200 h-full rounded-r-lg">+</button>
                </div>

              </div>
            ))}
          </div>

          {/* TOTAL */}
          <div className="mt-4 pt-4 border-t border-dashed border-gray-300 flex justify-between items-center">
            <span className="text-gray-600 font-medium">Total To Pay</span>
            <span className="text-xl font-bold text-gray-900">₹{grandTotal}</span>
          </div>
        </div>

        {/* --- 2. DETAILS FORM --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4">Delivery Details</h2>
          <div className="flex flex-col gap-4">
            {/* Name */}
            <div className="relative">
              <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            {/* Phone */}
            <div className="relative">
              <Phone size={18} className="absolute left-3 top-3.5 text-gray-400" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

      </div>

      {/* FOOTER BUTTON */}
      <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="container mx-auto max-w-2xl">
          <button
            onClick={handlePlaceOrder}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-green-700 active:scale-95 transition-all shadow-lg flex justify-between px-6"
          >
            <span>Pay ₹{grandTotal}</span>
            <span>PLACE ORDER &gt;</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default CheckoutPage;