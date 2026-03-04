import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, QrCode, Loader2 } from 'lucide-react';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const QRScannerModal = ({ isOpen, onClose }: QRScannerModalProps) => {
    const navigate = useNavigate();
    const [scanResult, setScanResult] = useState<string | null>(null);

    useEffect(() => {
        // Agar modal open nahi hai, toh camera initialize mat karo
        if (!isOpen) return;

        // Scanner configuration
        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 }, 
                rememberLastUsedCamera: true,
                supportedScanTypes: [0] // Sirf QR
            },
            false
        );

        const onScanSuccess = (decodedText: string) => {
            setScanResult(decodedText);
            
            // 1. Camera band karo
            scanner.clear().catch(console.error);
            
            // 2. Thoda delay dekar redirect karo taaki user ko loading dikhe
            setTimeout(() => {
                onClose(); // Modal band karo
                if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
                    window.location.href = decodedText;
                } else {
                    navigate(decodedText);
                }
            }, 1000);
        };

        const onScanFailure = (error: any) => {
            console.warn(error); // Warnings ko hide kiya hai
        };

        // Render scanner
        scanner.render(onScanSuccess, onScanFailure);

        // CLEANUP: Jab modal close ho toh camera background me chalu na rahe
        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            setScanResult(null); // Agli baar kholne ke liye reset
        };
    }, [isOpen, navigate, onClose]);

    // Agar modal open nahi hai toh kuch render mat karo
    if (!isOpen) return null;

    return (
        // Modal Overlay (Black blurred background)
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            
            {/* Modal Box */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                
                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-50 p-2 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-5 text-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                        <QrCode className="text-orange-600" size={24} />
                        Scan to Order
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Point your camera at the table QR code</p>
                </div>

                {/* Camera Container */}
                <div className="p-4 bg-black relative min-h-[300px] flex items-center justify-center">
                    {scanResult ? (
                        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center text-center p-6 z-40">
                            <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
                            <p className="text-gray-800 font-bold text-lg">Menu Found!</p>
                            <p className="text-gray-500 text-sm mt-2">Opening the restaurant menu...</p>
                        </div>
                    ) : (
                        // Yahan html5-qrcode apna camera inject karega
                        <div id="qr-reader" className="w-full h-full bg-black rounded-lg overflow-hidden border-none [&>div]:border-none"></div>
                    )}
                </div>
                
            </div>
        </div>
    );
};

export default QRScannerModal;