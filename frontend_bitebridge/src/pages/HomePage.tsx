import { useNavigate } from "react-router-dom";
import { 
  QrCode, 
  Smartphone,  
  ChefHat, 
  Utensils, 
  Zap,
  CheckCircle2
} from "lucide-react";
import { useState } from "react";
import QRScannerModal from "../components/common/QRScannerModal";

const HomePage = () => {
  const navigate = useNavigate();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[80vh] min-h-[500px] flex items-center justify-center">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop" 
            alt="Restaurant Dining" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-left px-4 max-w-7xl mx-auto w-full flex flex-col items-start mt-10">
          <span className="bg-orange-500/20 text-orange-400 border border-orange-500/50 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase mb-6 inline-flex items-center gap-2 backdrop-blur-sm shadow-lg">
            <Zap size={16} fill="currentColor" /> Smart Dining Experience
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg max-w-3xl">
            Skip the Wait. <br />
            Order with a <span className="text-orange-500">Simple Scan.</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
            No more waiting for the menu or the waiter. Just scan the QR code at your table, explore the digital menu, and place your order instantly from your phone.
          </p>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            {/* Ye button sidha /scan page pe le jayega jahan camera khulega */}
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 px-8 rounded-full text-lg transition-all shadow-orange-500/30 shadow-2xl active:scale-95 flex items-center justify-center gap-3 animate-pulse-slow"
            >
              <QrCode size={24}  />
              Scan QR to Order
            </button>
            <button 
              onClick={() => navigate('/restaurants')} // Optional: Agar aas paas ke restaurant dekhne ho
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-bold py-4 px-8 rounded-full text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              Explore Restaurants
            </button>
          </div>
        </div>
      </div>

      {/* --- HOW IT WORKS SECTION --- */}
      <div className="py-24 px-4 bg-white relative">
        <div className="container mx-auto text-center max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How BiteBridge Works</h2>
          <p className="text-gray-500 mb-16 text-lg">Your food is just three simple steps away.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gray-200 z-0"></div>

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white border-4 border-orange-100 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <QrCode className="text-orange-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">1. Scan QR Code</h3>
              <p className="text-gray-500 text-center px-4">Find the BiteBridge QR code at your table or vendor counter and scan it with your phone.</p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white border-4 border-orange-100 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Smartphone className="text-orange-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">2. Browse & Order</h3>
              <p className="text-gray-500 text-center px-4">Explore the rich digital menu, customize your dishes, and place your order directly.</p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="bg-white border-4 border-orange-100 w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl">
                <Utensils className="text-orange-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-900">3. Enjoy Your Meal</h3>
              <p className="text-gray-500 text-center px-4">Track your order status live. The food will be brought directly to your table when ready!</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- BENEFITS SECTION --- */}
      <div className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2070&auto=format&fit=crop" 
                alt="Friends eating" 
                className="rounded-3xl shadow-2xl"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Why diners love using BiteBridge</h2>
              <div className="space-y-6">
                {[
                  { title: "No waiting for menus", desc: "Instant access to the full digital menu the moment you sit down." },
                  { title: "Order at your own pace", desc: "Take your time to decide without feeling rushed by the staff." },
                  { title: "Live Order Tracking", desc: "Know exactly when your food is being prepared and served." },
                  { title: "Easy Add-ons", desc: "Want an extra coke? Just order it from your phone in one click." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="mt-1">
                      <CheckCircle2 className="text-green-500" size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">{item.title}</h4>
                      <p className="text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- VENDOR CTA (Join Us) --- */}
      <div className="bg-gray-900 text-white py-24 px-4 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-orange-500 rounded-full blur-[120px] opacity-30"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-blue-500 rounded-full blur-[120px] opacity-20"></div>

        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="flex justify-center mb-6">
            <ChefHat size={48} className="text-orange-500" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Turn your tables into <br/> <span className="text-orange-400">Smart Tables</span></h2>
          <p className="text-gray-400 mb-10 text-xl max-w-2xl mx-auto">
            Digitize your menu, reduce staff workload, and increase your table turnover rate. Give your customers the modern dining experience they expect.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/auth/vendor/register')} className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg active:scale-95">
              Register as Vendor
            </button>
            <button className="bg-transparent border-2 border-white/20 hover:bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg transition-all">
              View Vendor Benefits
            </button>
          </div>
        </div>
      </div>

<QRScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)} 
      />
    </div>
  );
};

export default HomePage;