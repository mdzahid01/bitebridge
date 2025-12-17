import { Store } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-orange-50">
      <div className="relative">
        {/* Background Blob */}
        <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-75"></div>
        
        {/* Main Logo */}
        <div className="relative bg-orange-600 p-6 rounded-full shadow-xl">
            <Store className="w-12 h-12 text-white" />
        </div>
      </div>
      
      <p className="mt-8 text-orange-800 font-bold text-xl tracking-wide">
        BiteBridge
      </p>
    </div>
  );
};

export default LoadingSpinner;