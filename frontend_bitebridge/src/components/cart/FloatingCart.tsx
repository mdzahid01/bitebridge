import { ShoppingCart, ChevronRight } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { Link } from "react-router-dom";

const FloatingCart = () => {
  const { getCartTotal, getCartItemsCount } = useCart();
  const totalItems = getCartItemsCount();
  const totalPrice = getCartTotal();

  if (totalItems === 0) return null;

  return (
    // Mobile: bottom-2 left-2 right-2 (Thoda edge ke paas)
    // Desktop: bottom-4 left-4 right-4 (Thoda aur upar)
    <div className="fixed bottom-2 left-2 right-2 md:bottom-4 md:left-4 md:right-4 z-50">
      <Link 
        to="/checkout" 
        // Mobile: py-2.5 px-3 (Compact height)
        // Desktop: p-4 (Comfortable size)
        className="bg-green-600 text-white py-2.5 px-4 md:p-4 rounded-lg md:rounded-xl shadow-xl flex justify-between items-center hover:bg-green-700 transition-all cursor-pointer"
      >
        
        {/* Left Side: Icon + Item Count */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Icon Container thoda dark kiya taaki stylish lage */}
          <div className="bg-green-800/30 p-1.5 rounded-md">
            <ShoppingCart size={18} className="md:w-5 md:h-5 text-white" />
          </div>
          
          <div className="flex flex-col">
            <span className="font-bold text-sm md:text-lg uppercase leading-none">
              {totalItems} Item{totalItems > 1 ? "s" : ""}
            </span>
          </div>
        </div>
        
        {/* Right Side: Price + Arrow */}
        <div className="flex items-center gap-2 md:gap-3 font-bold text-base md:text-lg">
          <span>₹{totalPrice}</span>
          <span className="bg-white/20 p-1 rounded-full">
            <ChevronRight size={16} className="md:w-5 md:h-5" />
          </span>
        </div>
      </Link>
    </div>
  );
};

export default FloatingCart;
