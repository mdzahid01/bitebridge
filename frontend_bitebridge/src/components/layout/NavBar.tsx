import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// ✅ Lucide Icons Import
import { 
    Store, 
    QrCode, 
    ShoppingBag, 
    UserCircle, 
    Menu, 
    X, 
    LogOut, 
    User,
    ChevronDown
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext' 
import authApi from '../../services/authApi';

const Navbar = () => {
    const { authUser, setAuthUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleLogout = async() => {
        try{
                const logoutResponse = await authApi.logout()
                if(logoutResponse.status === 200){
                setAuthUser(null);
                navigate('/');
                setIsOpen(false);
                }
        }catch (error) {
         console.log("something went wrong");
         toast.error("kuch to gadbad hua hai")
            
        }
       
    };

    const role = authUser?.role; 

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    
                    {/* =======================
                        1. LOGO SECTION 
                       ======================= */}
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <span className="bg-orange-600 text-white p-2 rounded-lg">
                                {/* Lucide Store Icon */}
                                <Store size={24} />
                            </span>
                            <span className="font-bold text-2xl tracking-tighter text-gray-800">
                                Bite<span className="text-orange-600">Bridge</span>
                            </span>
                        </Link>
                    </div>

                    {/* =======================
                        2. DESKTOP MENU LINKS 
                       ======================= */}
                    <div className="hidden md:flex items-center space-x-6">
                        
                        {/* A. GUEST */}
                        {!authUser && (
                            <>
                                <Link to="/" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Home</Link>
                                <Link to="/scan" className="flex items-center gap-1 text-gray-600 hover:text-orange-600 font-medium transition-colors">
                                    <QrCode size={18} /> 
                                    <span>Scan & Order</span>
                                </Link>
                                <div className="h-6 w-px bg-gray-300 mx-2"></div>
                                <Link to="/login" className="text-gray-600 hover:text-orange-600 font-medium transition-colors">Login</Link>
                                <Link to="/signup" className="bg-orange-600 text-white px-5 py-2 rounded-full font-medium hover:bg-orange-700 transition shadow-sm">
                                    Sign Up
                                </Link>
                                <Link to="/signup" className="text-sm text-gray-500 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md transition-colors">
                                    Are you a Vendor?
                                </Link>
                            </>
                        )}

                        {/* B. CUSTOMER */}
                        {role === 'customer' && (
                            <>
                                <Link to="/" className="text-gray-600 hover:text-orange-600 font-medium">Home</Link>
                                <Link to="/scan" className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-200 transition">
                                    <QrCode size={18} /> 
                                    <span className="text-sm font-semibold">Scan QR</span>
                                </Link>
                                <Link to="/my-orders" className="text-gray-600 hover:text-orange-600 font-medium">My Orders</Link>
                                <Link to="/cart" className="relative text-gray-600 hover:text-orange-600 transition-transform hover:scale-105">
                                    <ShoppingBag size={24} />
                                    {/* Cart Badge */}
                                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                                        0
                                    </span>
                                </Link>
                            </>
                        )}

                        {/* C. VENDOR OWNER */}
                        {role === 'vendorOwner' && (
                            <>
                                <Link to="/vendor/dashboard" className="text-gray-600 hover:text-orange-600 font-medium">Dashboard</Link>
                                <Link to="/menu-management" className="text-gray-600 hover:text-orange-600 font-medium">Menu</Link>
                                <Link to="/category-management" className="text-gray-600 hover:text-orange-600 font-medium">Category</Link>
                                <Link to="/staff-management" className="text-gray-600 hover:text-orange-600 font-medium">Staff Management</Link>
                                <Link to="/vendor/create-order" className="text-gray-600 hover:text-orange-600 font-medium">Create Order</Link>
                                <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide border border-orange-200">
                                    Owner
                                </div>
                            </>
                        )}

                        {/* D. STAFF */}
                        {role === 'vendorStaff' && (
                            <>
                                <Link to="/vendor/dashboard" className="text-gray-600 hover:text-orange-600 font-medium">Live Orders</Link>
                                <Link to="/vendor/menu" className="text-gray-600 hover:text-orange-600 font-medium">Availability</Link>
                                <Link to="/vendor/create-order" className="text-gray-600 hover:text-orange-600 font-medium">Create Order</Link>
                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-xs font-bold uppercase tracking-wide border border-blue-200">
                                    Staff
                                </div>
                            </>
                        )}

                        {/* USER PROFILE & LOGOUT */}
                        {authUser && (
                            <div className="relative group ml-2">
                                <button className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors p-1 rounded-md">
                                    <UserCircle size={28} className="text-gray-400 group-hover:text-orange-600" />
                                    <span className="font-medium capitalize max-w-[100px] truncate">{authUser.name}</span>
                                    <ChevronDown size={16} className="text-gray-400 group-hover:text-orange-600 transition-transform group-hover:rotate-180" />
                                </button>
                                {/* this  div is just for filling gap so Dropdown donot get hidden */}
                                <div className="absolute top-full left-0 right-0 h-2"></div>
                                {/* Dropdown */}
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-xl rounded-xl py-2 hidden group-hover:block border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 py-2 border-b border-gray-100 mb-1">
                                        <p className="text-sm text-gray-500">Signed in as</p>
                                        <p className="text-sm font-semibold text-gray-900 truncate">{authUser.email}</p>
                                    </div>
                                    
                                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                        <User size={18} />
                                        Profile
                                    </Link>
                                    
                                    <button onClick={handleLogout} className="w-full flex items-center gap-2 text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors mt-1">
                                        <LogOut size={18} />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* =======================
                        3. MOBILE MENU BUTTON 
                       ======================= */}
                    <div className="md:hidden flex items-center">
                        <button onClick={toggleMenu} className="text-gray-700 hover:text-orange-600 focus:outline-none p-2">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* =======================
                4. MOBILE MENU DROPDOWN 
               ======================= */}
            {isOpen && (
                <div className="md:hidden bg-white border-t pb-4 shadow-xl">
                    <div className="px-4 pt-4 space-y-3">
                        
                        {/* GUEST MOBILE */}
                        {!authUser && (
                            <>
                                <MobileLink to="/" onClick={toggleMenu}>Home</MobileLink>
                                <MobileLink to="/scan" onClick={toggleMenu} icon={<QrCode size={18} />}>Scan QR</MobileLink>
                                <MobileLink to="/login" onClick={toggleMenu}>Login</MobileLink>
                                <MobileLink to="/signup" onClick={toggleMenu}>Signup</MobileLink>
                                <div className="border-t border-gray-100 my-2"></div>
                                <MobileLink to="/signup" onClick={toggleMenu} className="text-orange-600 font-semibold bg-orange-50">Are you a Vendor?</MobileLink>
                            </>
                        )}

                        {/* CUSTOMER MOBILE */}
                        {role === 'customer' && (
                            <>
                                <UserProfileMobile user={authUser} />
                                <MobileLink to="/" onClick={toggleMenu}>Home</MobileLink>
                                <MobileLink to="/scan" onClick={toggleMenu} icon={<QrCode size={18} />}>Scan QR</MobileLink>
                                <MobileLink to="/my-orders" onClick={toggleMenu}>My Orders</MobileLink>
                                <MobileLink to="/cart" onClick={toggleMenu} icon={<ShoppingBag size={18} />}>My Cart</MobileLink>
                                <LogoutMobile onClick={handleLogout} />
                            </>
                        )}

                        {/* VENDOR MOBILE */}
                        {role === 'vendorOwner' && (
                            <>
                                <UserProfileMobile user={authUser} role="Owner" />
                                <MobileLink to="/category-management" onClick={toggleMenu}>category management</MobileLink>
                                <MobileLink to="/menu-management" onClick={toggleMenu}>Menu Management</MobileLink>
                                <MobileLink to="/staff-management" onClick={toggleMenu}>Staff</MobileLink>
                                <LogoutMobile onClick={handleLogout} />
                            </>
                        )}

                        {/* STAFF MOBILE */}
                        {role === 'vendorStaff' && (
                            <>
                                <UserProfileMobile user={authUser} role="Staff" />
                                <MobileLink to="/vendor/dashboard" onClick={toggleMenu}>Live Orders</MobileLink>
                                <MobileLink to="/vendor/menu" onClick={toggleMenu}>Item Availability</MobileLink>
                                <LogoutMobile onClick={handleLogout} />
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

// --- Helper Components for Clean Code ---

const MobileLink = ({ to, children, onClick, className = "", icon }: any) => (
    <Link 
        to={to} 
        onClick={onClick} 
        className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition duration-200 ${className}`}
    >
        {icon && <span>{icon}</span>}
        {children}
    </Link>
);

const UserProfileMobile = ({ user, role }: any) => (
    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-2 border border-gray-100">
        <div className="bg-orange-100 p-2 rounded-full text-orange-600">
            <User size={20} />
        </div>
        <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{role || user.role}</p>
        </div>
    </div>
);

const LogoutMobile = ({ onClick }: any) => (
    <button 
        onClick={onClick} 
        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition duration-200 mt-2"
    >
        <LogOut size={18} />
        Logout
    </button>
);

export default Navbar;