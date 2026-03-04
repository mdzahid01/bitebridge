import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Construction, ArrowLeft, Wrench } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle'; // Agar tune custom hook banaya hai toh, warna hata dena

const PageUnderConstruction: React.FC = () => {
    usePageTitle("Coming Soon..."); // Optional: Browser tab title change karne ke liye
    const navigate = useNavigate();

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
            
            {/* Animated Icon Container */}
            <div className="relative mb-8">
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-orange-400 rounded-full blur-2xl animate-pulse opacity-30"></div>
                
                {/* Main Icon Box */}
                <div className="relative bg-white p-6 rounded-full shadow-xl border border-orange-100 text-orange-600 flex items-center justify-center">
                    <Construction size={72} strokeWidth={1.5} className="animate-bounce" style={{ animationDuration: '2s' }} />
                    <Wrench size={24} className="absolute -bottom-2 -right-2 text-gray-700 bg-white rounded-full p-1 shadow-sm" />
                </div>
            </div>

            {/* Text Content */}
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                We're Building Something <span className="text-orange-600">Awesome</span>
            </h1>
            <p className="text-gray-500 max-w-lg mx-auto mb-10 text-base md:text-lg">
                This page is currently under construction. Our developers are working hard with their digital wrenches to get this ready for you!
            </p>

            {/* Action Button */}
            <button
                onClick={() => navigate(-1)} // User ko exactly pichle page par bhej dega
                className="flex items-center gap-2 bg-gray-900 text-white px-8 py-3.5 rounded-full font-medium hover:bg-orange-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95"
            >
                <ArrowLeft size={18} />
                Take Me Back
            </button>
            
        </div>
    );
};

export default PageUnderConstruction;