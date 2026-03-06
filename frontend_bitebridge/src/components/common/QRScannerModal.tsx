import { useEffect, useState, useRef } from 'react';
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
    
    // FIX 1: Scanner ki instance ko track karne ke liye ref banaya
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        // Agar scanner already ban chuka hai toh wapas mat banao (React Strict Mode fix)
        if (scannerRef.current) return;

        const scanner = new Html5QrcodeScanner(
            "qr-reader",
            { 
                fps: 10, 
                qrbox: { width: 250, height: 250 }, 
                rememberLastUsedCamera: true,
                supportedScanTypes: [0] 
            },
            false
        );
        
        // Ref me save kar lo taaki double render na ho
        scannerRef.current = scanner;

        const onScanSuccess = (decodedText: string) => {
            setScanResult(decodedText);
            
            // Camera band karo
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
            
            setTimeout(() => {
                onClose(); 
                if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
                    window.location.href = decodedText;
                } else {
                    navigate(decodedText);
                }
            }, 1000);
        };

        const onScanFailure = (_error: any) => {
            // Warnings hide karne ke liye empty rakha hai
            // console.warn(error)
        };

        scanner.render(onScanSuccess, onScanFailure);

        return () => {
            // CLEANUP: Modal band hone par properly destroy karo
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
                scannerRef.current = null;
            }
            setScanResult(null); 
        };
    }, [isOpen, navigate, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
            
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
                
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-50 p-2 bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="bg-gray-50 border-b border-gray-100 p-5 text-center">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center justify-center gap-2">
                        <QrCode className="text-orange-600" size={24} />
                        Scan to Order
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">Point your camera at the table QR code</p>
                </div>

                {/*  FIX 2: bg-black hata diya aur height fix kar di taaki library ka UI dikhe */}
                <div className="p-4 bg-white relative min-h-[350px] flex items-center justify-center">
                    {scanResult ? (
                        <div className="absolute inset-0 bg-white flex flex-col items-center justify-center text-center p-6 z-40">
                            <Loader2 size={40} className="animate-spin text-orange-500 mb-4" />
                            <p className="text-gray-800 font-bold text-lg">Menu Found!</p>
                            <p className="text-gray-500 text-sm mt-2">Opening the restaurant menu...</p>
                        </div>
                    ) : (
                        // ✅ FIX 3: Extraneous border/height classes hata di, ab permission button properly dikhega
                        <div id="qr-reader" className="w-full text-black"></div>
                    )}
                </div>
                
            </div>
        </div>
    );
};

export default QRScannerModal;