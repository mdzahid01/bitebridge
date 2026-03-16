import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import authApi from '../../services/authApi';
import toast from 'react-hot-toast';
import { User, Phone, Mail, Shield, Save, Loader2, ArrowLeft } from 'lucide-react';
import usePageTitle from '../../hooks/usePageTitle';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
    usePageTitle("My Profile");
    const { authUser, setAuthUser } = useAuth();
    
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
    });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (authUser) {
            setFormData({
                name: authUser.name || '',
                phone: authUser.phone || '',
            });
            setImagePreview(authUser.imageUrl || null);
        }
    }, [authUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProfileImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim() || !formData.phone.trim()) {
            toast.error("Name and Phone cannot be empty");
            return;
        }

        if (formData.phone.length !== 10) {
            toast.error("Phone number must be exactly 10 digits");
            return;
        }

        try {
            setIsLoading(true);
            const dataToSubmit = new FormData();
            dataToSubmit.append('name', formData.name);
            dataToSubmit.append('phone', formData.phone);
            if (profileImage) {
                dataToSubmit.append('profileImage', profileImage);
            }

            const response = await authApi.updateProfile(dataToSubmit);
            
            if (response.data?.user) {
                setAuthUser(response.data.user);
                toast.success("Profile updated successfully!");
                setIsEditing(false);
                setProfileImage(null); // Clear the file after success
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Failed to update profile";
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    if (!authUser) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 animate-spin text-orange-600 mb-4" />
                <p className="text-gray-500 font-medium">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-6">
            <div className="max-w-2xl mx-auto px-4">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Link to={authUser.role === 'customer' ? "/" : "/dashboard"} className="p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-orange-600 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <User className="text-orange-600" />
                            My Profile
                        </h1>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Top Banner section */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-400 h-32 relative"></div>
                    
                    <div className="px-6 sm:px-10 pb-10 relative">
                        {/* Avatar */}
                        <div className="absolute -top-16 left-6 sm:left-10 bg-white p-2 rounded-full shadow-md relative inline-block">
                            {imagePreview ? (
                                <img 
                                    src={imagePreview} 
                                    alt={authUser.name} 
                                    className="w-24 h-24 rounded-full object-cover border-4 border-orange-50"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center border-4 border-white text-orange-600">
                                    <User size={48} />
                                </div>
                            )}
                            
                            {isEditing && (
                                <label className="absolute bottom-0 right-0 bg-orange-600 p-1.5 rounded-full text-white cursor-pointer hover:bg-orange-700 transition shadow-md border-2 border-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        className="hidden" 
                                        onChange={handleImageChange}
                                    />
                                </label>
                            )}
                        </div>

                        {/* Top Info section */}
                        <div className="pt-12 flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 capitalize">{authUser.name}</h2>
                                <p className="text-sm font-medium text-gray-500 flex items-center gap-1 mt-1 capitalize">
                                    <Shield size={14} className="text-orange-500" />
                                    {authUser.role === 'vendorOwner' ? 'Vendor Owner' : 
                                     authUser.role === 'vendorStaff' ? 'Staff' : 'Customer'}
                                </p>
                            </div>
                            {!isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="px-5 py-2 bg-orange-50 text-orange-600 text-sm font-bold rounded-xl hover:bg-orange-100 transition-colors border border-orange-200"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>

                        {/* Form / Display Details */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* Personal Information Group */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4">Personal Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Name Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <User size={16} className="text-gray-400" /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:opacity-70 disabled:bg-gray-100 text-gray-800 font-medium"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    {/* Phone Field */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Phone size={16} className="text-gray-400" /> Phone Number
                                        </label>
                                        <input
                                            type="text"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            maxLength={10}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition disabled:opacity-70 disabled:bg-gray-100 text-gray-800 font-medium tracking-wide"
                                            placeholder="9876543210"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Account Information Group */}
                            <div className="space-y-4 pt-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2 mb-4">Account Details</h3>
                                
                                <div className="grid grid-cols-1 gap-5">
                                    {/* Email Field (Always Readonly for now as email change usually requires verification) */}
                                    <div className="space-y-1.5 relative group">
                                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                            <Mail size={16} className="text-gray-400" /> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={authUser.email}
                                            disabled
                                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-medium cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Email cannot be changed directly.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="flex items-center gap-3 pt-6 border-t mt-8">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({ name: authUser.name, phone: authUser.phone }); 
                                            setProfileImage(null);
                                            setImagePreview(authUser.imageUrl || null);
                                        }}
                                        disabled={isLoading}
                                        className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 py-3 px-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 shadow-md"
                                    >
                                        {isLoading ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
