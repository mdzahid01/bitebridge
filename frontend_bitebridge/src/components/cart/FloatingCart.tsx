import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";

const FloatingCart = () => {
  const { getCartTotal, getCartItemsCount } = useCart();
  const totalItems = getCartItemsCount();
  const totalPrice = getCartTotal();

  if (totalItems === 0) return null; // Cart khali hai to kuch mat dikhao

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <Link to="/checkout" className="bg-green-600 text-white p-4 rounded-xl shadow-xl flex justify-between items-center hover:bg-green-700 transition-all cursor-pointer">
        <div className="flex flex-col items-start">
          <span className="font-bold text-lg uppercase flex items-center gap-2">
            <ShoppingBag size={20} fill="white" /> {totalItems} ITEM{totalItems > 1 ? "S" : ""}
          </span>
          <span className="text-xs text-green-100">
             Extra charges may apply
          </span>
        </div>
        
        <div className="flex items-center gap-2 font-bold text-lg">
          <span>₹{totalPrice}</span>
          <span className="bg-white/20 p-1 rounded-full">
            <ChevronRight size={20} />
          </span>
        </div>
      </Link>
    </div>
  );
};

export default FloatingCart;