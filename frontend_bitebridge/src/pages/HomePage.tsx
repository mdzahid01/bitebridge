import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, ShoppingBag, Clock, ChefHat, ArrowRight, Star } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Filhal demo ke liye hum seedha kisi vendor pe bhej sakte hain ya search page pe
      // Abhi ke liye hum sirf console log kar rahe hain
      console.log("Searching for:", searchTerm);
      // Future me: navigate(`/search?q=${searchTerm}`)
    }
  };

  return (
    <div className="min-h-screen bg-white">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[500px] md:h-[600px] flex items-center justify-center">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop" 
            alt="Food Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
          <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4 inline-block shadow-lg">
            #1 Food Platform
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
            Craving Something <span className="text-orange-500">Delicious?</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Order from your favorite local vendors and get fresh food delivered to your table or doorstep in minutes.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl shadow-2xl max-w-2xl mx-auto">
            <div className="flex-grow flex items-center px-4 bg-gray-50 rounded-xl">
              <MapPin className="text-orange-500 shrink-0" size={20} />
              <input 
                type="text" 
                placeholder="Enter your delivery location..." 
                className="w-full p-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="h-px sm:h-auto sm:w-px bg-gray-200 mx-2"></div>
            <div className="flex-grow flex items-center px-4 bg-gray-50 rounded-xl">
              <Search className="text-gray-400 shrink-0" size={20} />
              <input 
                type="text" 
                placeholder="Search for restaurant or food..." 
                className="w-full p-3 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-md active:scale-95">
              Find Food
            </button>
          </form>
        </div>
      </div>

      {/* --- FEATURES SECTION --- */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto text-center max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Why Choose BiteBridge?</h2>
          <p className="text-gray-500 mb-12">Bridging the gap between your hunger and the best local food.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-500 transition-colors">
                <ShoppingBag className="text-orange-600 group-hover:text-white transition-colors" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Easy Ordering</h3>
              <p className="text-gray-500 text-sm">Browse menus, customize your meal, and checkout in seconds with our user-friendly app.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500 transition-colors">
                <Clock className="text-green-600 group-hover:text-white transition-colors" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Fast Delivery</h3>
              <p className="text-gray-500 text-sm">Real-time tracking and optimized routes ensure your food arrives hot and fresh.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 transition-colors">
                <Star className="text-blue-600 group-hover:text-white transition-colors" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Top Quality</h3>
              <p className="text-gray-500 text-sm">We partner with only the best local vendors to guarantee quality and hygiene.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- POPULAR CATEGORIES (Visuals) --- */}
      <div className="py-20 container mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
           <div>
             <h2 className="text-3xl font-bold text-gray-800 mb-2">Explore by Category</h2>
             <p className="text-gray-500">What's on your mind today?</p>
           </div>
           {/* Placeholder link */}
           <button className="text-orange-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
             View All <ArrowRight size={18} />
           </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
                { name: "Burger", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60" },
                { name: "Pizza", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60" },
                { name: "Biryani", img: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=500&q=60" },
                { name: "Desserts", img: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=500&q=60" },
            ].map((cat, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden aspect-[4/3] cursor-pointer shadow-md">
                    <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                        <h3 className="text-white text-xl font-bold tracking-wide">{cat.name}</h3>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- VENDOR CTA (Join Us) --- */}
      <div className="bg-gray-900 text-white py-20 px-4">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
                <img 
                    src="https://images.unsplash.com/photo-1556910103-1c02745a30bf?auto=format&fit=crop&w=1000&q=80" 
                    alt="Chef Cooking" 
                    className="rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
                />
            </div>
            <div className="md:w-1/2 text-left">
                <div className="flex items-center gap-2 text-orange-400 font-bold mb-4">
                    <ChefHat size={24} />
                    <span>BECOME A PARTNER</span>
                </div>
                <h2 className="text-4xl font-bold mb-6 leading-tight">Grow your business with BiteBridge</h2>
                <p className="text-gray-400 mb-8 text-lg">
                    Join thousands of restaurants and shops who trust BiteBridge to handle their online orders and delivery. No hidden fees, just growth.
                </p>
                <div className="flex gap-4">
                    <button onClick={() => navigate('/auth/vendor/register')} className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95">
                        Register Your Store
                    </button>
                    <button className="bg-transparent border border-white/20 hover:bg-white/10 text-white px-8 py-3 rounded-xl font-bold transition-all">
                        Learn More
                    </button>
                </div>
            </div>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;