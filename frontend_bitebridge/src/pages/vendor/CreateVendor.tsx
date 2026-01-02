import { useState, type ChangeEvent, type FormEvent } from "react"
import axiosClient from "../../services/axiosClient";
import { useNavigate } from "react-router-dom";
import { Store, MapPin, Upload, Loader2, AlertCircle } from "lucide-react"; // Icons add kiye

function CreateVendor() {

    const navigate = useNavigate()

    const [formData, setFormData] = useState({
        shopName: '',
        address: '',
    })

    const [shopPhoto, setShopPhoto] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }))
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setShopPhoto(e.target.files[0])
        }
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true)
        setError(null);
        if (!formData.shopName || formData.shopName.length < 1) {
            setError("Shop Name is required")
            setLoading(false)
            return
        }
        
        if (!formData.address || formData.address.length < 1) {
            setError("Address is required")
            setLoading(false)
            return
        }
        
        if (!shopPhoto) {
            setError("shop photo is required")
            setLoading(false)
            return
        }
        try {
            const dataToSubmit = new FormData()
            dataToSubmit.append('shopName', formData.shopName)
            dataToSubmit.append('address', formData.address)
            dataToSubmit.append('shopImage', shopPhoto)

            const response = await axiosClient.post('/vendors/create-vendor', dataToSubmit)
            alert("success: " + response.data) // (Note: Alert ko Toast me badal sakte ho baad me)
            console.log(response.data)
            setError(response.data.message)
            navigate('/create-category')

        } catch (err: any) {
            console.log('vendor creation failed:', err.response?.data);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
                console.log(err.response)
            } else if (err.message) {
                console.log(err.response)
                setError(err.message);
            } else {
                setError('An error occurred during signup.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                
                {/* Header Section */}
                <div className="bg-orange-600 p-8 text-center">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <Store className="text-white h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Register Your Shop</h2>
                    <p className="text-orange-100 text-sm mt-2">Start your selling journey with BiteBridge</p>
                </div>

                {/* Form Section */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} method="post" className="space-y-6">
                        
                        {/* Shop Name Input */}
                        <div>
                            <label htmlFor="shopName" className="block text-sm font-medium text-gray-700 mb-1">
                                Shop Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Store className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="shopName"
                                    id="shopName"
                                    placeholder="e.g. Rahul's Burger Point"
                                    onChange={handleChange}
                                    value={formData.shopName}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Address Input */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                Shop Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    name="address"
                                    id="address"
                                    placeholder="e.g. Sector 62, Noida"
                                    onChange={handleChange}
                                    value={formData.address}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Image Upload Area (Styled) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Shop Image</label>
                            <div className="relative group">
                                <div className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer h-48 ${
                                    shopPhoto ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-gray-50'
                                }`}>
                                    
                                    {shopPhoto ? (
                                        // Image Preview Logic (Safe for render)
                                        <div className="relative w-full h-full">
                                            <img 
                                                src={URL.createObjectURL(shopPhoto)} 
                                                alt="Preview" 
                                                className="w-full h-full object-cover rounded-lg shadow-sm"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                <p className="text-white font-medium text-sm">Click to Change</p>
                                            </div>
                                        </div>
                                    ) : (
                                        // Upload Placeholder
                                        <div className="pointer-events-none">
                                            <div className="bg-gray-100 p-3 rounded-full inline-block mb-3">
                                                <Upload className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-600 font-medium">Click to upload shop photo</p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                    )}

                                    {/* Actual Hidden Input */}
                                    <input 
                                        type="file"
                                        name="shopPhoto"
                                        id="shopPhoto"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-sm animate-in fade-in slide-in-from-top-2">
                                <AlertCircle size={16} />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95 ${
                                loading 
                                ? 'bg-orange-400 cursor-not-allowed' 
                                : 'bg-orange-600 hover:bg-orange-700 shadow-orange-200'
                            }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Creating Shop...
                                </>
                            ) : (
                                "Create Shop Profile"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreateVendor