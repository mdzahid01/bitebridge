import { useState, useEffect, useRef } from 'react';
import { Store, MapPin, Camera, Save, Loader2, Image as ImageIcon, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosClient from '../../services/axiosClient';

const UpdateVendorPage = () => {
    // States
    const [shopName, setShopName] = useState("");
    const [address, setAddress] = useState("");
    
    //api se fetch image
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    
    //user se uploaded image
    const [newImageFile, setNewImageFile] = useState<File | null>(null);

    //temporary image for preview
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 1. Fetch old data
    useEffect(() => {
        const fetchVendorDetails = async () => {
            try {
                const response = await axiosClient.get('/vendors/get-vendor-details');
                const data = response.data.shopDetails;
                
                if (data) {
                    setShopName(data.shopName || "");
                    setAddress(data.address || "");
                    setCurrentImageUrl(data.imageUrl || null);
                }
            } catch (error: any) {
                console.error("Fetch details error:", error);
                toast.error("Failed to load shop details");
            } finally {
                setIsLoading(false);
            }
        };

        fetchVendorDetails();
    }, []);

    // 2. Handle New Image Selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size should be less than 5MB");
                return;
            }
            setNewImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // 3. Clear Nayi Selected Image
    const handleClearSelection = (e: React.MouseEvent) => {
        e.stopPropagation(); // Isse box pe click nahi hoga, sirf button pe click hoga
        setNewImageFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // Input ko bhi khali kar do
        }
    };

    // 4. Update Function
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!shopName.trim() || !address.trim()) {
            toast.error("Shop Name and Address are required!");
            return;
        }

        setIsSaving(true);

        try {
            const formData = new FormData();
            formData.append('shopName', shopName);
            formData.append('address', address);
            
            if (newImageFile) {
                formData.append('shopImage', newImageFile);
            }

            const response = await axiosClient.put('/vendors/update-vendor', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            toast.success("Shop details updated successfully!", { position: 'bottom-center' });
            
            setCurrentImageUrl(response.data.vendor.imageUrl);
            setPreviewUrl(null);
            setNewImageFile(null);

        } catch (error: any) {
            console.error("Update error:", error);
            toast.error(error.response?.data?.message || "Failed to update details");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-orange-500" size={40} />
            </div>
        );
    }

    const displayImage = previewUrl || currentImageUrl;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Shop Settings</h1>
                <p className="text-gray-500 mt-1">Update your shop's cover profile and details.</p>
            </div>

            <form onSubmit={handleUpdate} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
                
                {/* --- HORIZONTAL COVER IMAGE SECTION --- */}
                <div className="w-full">
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                        Shop Cover Image
                    </label>
                    
                    <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 group bg-gray-50">
                        
                        {displayImage ? (
                            <>
                                <img 
                                    src={displayImage} 
                                    alt="Shop Cover Preview" 
                                    className="w-full h-full object-cover" // object-cover image ko wide fit karega
                                />
                                
                                {/* Overlay for Change Image (Clickable) */}
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white"
                                >
                                    <Camera size={32} className="mb-2" />
                                    <span className="text-lg font-medium">Change Cover Photo</span>
                                </div>

                                {/* CLEAR BUTTON (Sirf tab dikhega jab nayi image select ki ho) */}
                                {previewUrl && (
                                    <button
                                        type="button"
                                        onClick={handleClearSelection}
                                        className="absolute top-4 right-4 z-10 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-105"
                                        title="Remove selected image"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </>
                        ) : (
                            // Agar koi image nahi hai (backend se bhi image nahi mili us case me)
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-gray-400 hover:text-orange-500 hover:bg-orange-50/50 transition-colors"
                            >
                                <ImageIcon size={48} className="mb-3" />
                                <span className="font-medium">Upload Cover Image</span>
                                <span className="text-xs mt-1 text-gray-400">(Recommended: 16:9 ratio, Max 5MB)</span>
                            </div>
                        )}

                        <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/jpeg, image/png, image/webp"
                            className="hidden"
                        />
                    </div>
                </div>

                {/* --- TEXT INPUTS SECTION --- */}
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Shop Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Store className="text-gray-400" size={18} />
                            </div>
                            <input
                                type="text"
                                value={shopName}
                                onChange={(e) => setShopName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                                placeholder="Enter your shop name"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Shop Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute top-3 left-0 pl-3 pointer-events-none">
                                <MapPin className="text-gray-400" size={18} />
                            </div>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                rows={3}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                                placeholder="Complete shop address"
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* --- SUBMIT BUTTON --- */}
                <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving || (!shopName.trim() || !address.trim())}
                        className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <Save size={18} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UpdateVendorPage;