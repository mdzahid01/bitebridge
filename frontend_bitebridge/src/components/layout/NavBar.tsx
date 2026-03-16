import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Store,
  QrCode,
  ShoppingBag,
  UserCircle,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  LayoutDashboard,
  Package,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import authApi from "../../services/authApi";

const Navbar = () => {
  const { authUser, setAuthUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { getCartItemsCount } = useCart();

  const getLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `block px-3 py-2 rounded-md text-sm lg:text-base font-medium transition-colors duration-200 whitespace-nowrap ${
      isActive
        ? "text-orange-600 font-bold bg-orange-50"
        : "text-gray-600 hover:text-orange-600 hover:bg-gray-50"
    }`;

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      const logoutResponse = await authApi.logout();
      if (logoutResponse.status === 200) {
        setAuthUser(null);
        navigate("/");
        setIsOpen(false);
      }
    } catch (error) {
      console.log("something went wrong", error);
      toast.error("Logout failed");
    }
  };

  const role = authUser?.role;
  const isVendorOrStaff = role === "vendorOwner" || role === "vendorStaff";

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* =======================
                        1. LOGO SECTION 
                        ======================= */}
          <div className="flex items-center">
            <Link
              to={isVendorOrStaff ? "/live-orders" : "/"}
              className="flex-shrink-0 flex items-center gap-2"
            >
              <span className="bg-orange-600 text-white p-2 rounded-lg">
                <Store size={24} />
              </span>
              <span className="font-bold text-xl lg:text-2xl tracking-tighter text-gray-800">
                Bite<span className="text-orange-600">Bridge</span>
              </span>
            </Link>
          </div>

          {/* =======================
                        2. DESKTOP MENU NavLinks 
                        ======================= */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {/* A. GUEST */}
            {!authUser && (
              <>
                <NavLink
                  to="/"
                  className="text-gray-600 hover:text-orange-600 font-medium transition-colors whitespace-nowrap"
                >
                  Home
                </NavLink>
                <NavLink
                  to="/scan"
                  className="flex items-center gap-1 text-gray-600 hover:text-orange-600 font-medium transition-colors whitespace-nowrap"
                >
                  <QrCode size={18} />
                  <span>Scan & Order</span>
                </NavLink>
                <NavLink
                  to="/my-current-orders"
                  className="flex items-center gap-1 text-gray-600 hover:text-orange-600 font-medium transition-colors whitespace-nowrap"
                >
                  <Package size={18} />
                  <span>Track Order</span>
                </NavLink>
                <div className="h-6 w-px bg-gray-300 mx-1"></div>
                <NavLink
                  to="/login"
                  className="text-gray-600 hover:text-orange-600 font-medium transition-colors whitespace-nowrap"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/signup"
                  className="bg-orange-600 text-white px-5 py-2 rounded-full font-medium hover:bg-orange-700 transition shadow-sm whitespace-nowrap"
                >
                  Sign Up
                </NavLink>
                <NavLink
                  to="/signup?usertype=vendor"
                  className="text-sm text-gray-500 hover:text-gray-800 border border-gray-300 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
                >
                  Are you a Vendor?
                </NavLink>
              </>
            )}

            {/* B. CUSTOMER */}
            {role === "customer" && (
              <>
                <NavLink to="/" className={getLinkClass}>
                  Home
                </NavLink>
                <NavLink
                  to="/scan"
                  className="flex items-center gap-2 bg-gray-100 text-gray-800 px-4 py-2 rounded-full hover:bg-gray-200 transition whitespace-nowrap"
                >
                  <QrCode size={18} />
                  <span className="text-sm font-semibold">Scan QR</span>
                </NavLink>
                <NavLink
                  to="/my-current-orders"
                  className="flex items-center gap-1 text-gray-600 hover:text-orange-600 font-medium transition-colors whitespace-nowrap"
                >
                  {/* <Package size={18} /> */}
                  <span>Track Order</span>
                </NavLink>
                <NavLink
                  to="/my-previous-orders"
                  className="flex items-center gap-1 text-gray-600 hover:text-orange-600 font-medium transition-colors whitespace-nowrap"
                >
                  {/* <Package size={18} /> */}
                  <span>Previous Orders</span>
                </NavLink>
                <NavLink
                  to="/checkout"
                  className="relative text-gray-600 hover:text-orange-600 transition-transform hover:scale-105 p-2"
                >
                  <ShoppingBag size={24} />
                  {getCartItemsCount() > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                      {getCartItemsCount()}
                    </span>
                  )}
                </NavLink>
              </>
            )}

            {/* C. VENDOR OWNER / STAFF */}
            {isVendorOrStaff && (
              <>
                {/* Sirf Dashboard ka link aur Role Badge */}
                <NavLink to="/dashboard" className={getLinkClass}>
                  <span className="flex items-center gap-2">
                    <LayoutDashboard size={18} /> Dashboard
                  </span>
                </NavLink>

                <div
                  className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wide border ${
                    role === "vendorOwner"
                      ? "bg-orange-100 text-orange-800 border-orange-200"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  }`}
                >
                  {role === "vendorOwner" ? "Owner" : "Staff"}
                </div>
              </>
            )}

            {/* USER PROFILE & LOGOUT */}
            {authUser && (
              <div className="relative group ml-2">
                <button className="flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors p-1 rounded-md">
                  <UserCircle
                    size={28}
                    className="text-gray-400 group-hover:text-orange-600"
                  />
                  <span className="font-medium capitalize max-w-[100px] truncate hidden xl:block">
                    {authUser.name}
                  </span>
                  <ChevronDown
                    size={16}
                    className="text-gray-400 group-hover:text-orange-600 transition-transform group-hover:rotate-180"
                  />
                </button>
                <div className="absolute top-full left-0 right-0 h-2"></div>
                <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-xl rounded-xl py-2 hidden group-hover:block border border-gray-100 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {authUser.email}
                    </p>
                  </div>
                  <NavLink
                    to="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                  >
                    <User size={18} /> Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors mt-1"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* =======================
                        3. MOBILE MENU BUTTON 
                        ======================= */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-orange-600 focus:outline-none p-2 rounded-md hover:bg-gray-100"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* =======================
                4. MOBILE MENU DROPDOWN 
                ======================= */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t pb-4 shadow-xl absolute w-full left-0 top-16 z-40 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 pt-4 space-y-3">
            {/* GUEST MOBILE */}
            {!authUser && (
              <>
                <MobileNavLink to="/" onClick={toggleMenu}>
                  Home
                </MobileNavLink>
                <MobileNavLink
                  to="/scan"
                  onClick={toggleMenu}
                  icon={<QrCode size={18} />}
                >
                  Scan QR
                </MobileNavLink>
                <MobileNavLink
                  to="/my-current-orders"
                  onClick={toggleMenu}
                  icon={<Package size={18} />}
                >
                  Track Order
                </MobileNavLink>
                <MobileNavLink to="/login" onClick={toggleMenu}>
                  Login
                </MobileNavLink>
                <MobileNavLink to="/signup" onClick={toggleMenu}>
                  Signup
                </MobileNavLink>
                <div className="border-t border-gray-100 my-2"></div>
                <MobileNavLink
                  to="/signup?usertype=vendor"
                  onClick={toggleMenu}
                  className="text-orange-600 font-semibold bg-orange-50"
                >
                  Are you a Vendor?
                </MobileNavLink>
              </>
            )}

            {/* CUSTOMER MOBILE */}
            {role === "customer" && (
              <>
                <UserProfileMobile user={authUser} role="Customer" />
                <MobileNavLink to="/" onClick={toggleMenu}>
                  Home
                </MobileNavLink>
                <MobileNavLink
                  to="/scan"
                  onClick={toggleMenu}
                  icon={<QrCode size={18} />}
                >
                  Scan QR
                </MobileNavLink>

                <MobileNavLink
                  to="/my-current-orders"
                  onClick={toggleMenu}
                  icon={<Package size={18} />}
                >
                  Track Order
                </MobileNavLink>
               
                <MobileNavLink
                  to="/my-previous-orders"
                  onClick={toggleMenu}
                  icon={<Package size={18} />}
                >
                Previous Orders
                </MobileNavLink>


                <MobileNavLink
                  to="/checkout"
                  onClick={toggleMenu}
                  icon={<ShoppingBag size={18} />}
                >
                  <div className="flex items-start">
                    <span>My Cart</span>
                    {getCartItemsCount() > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-[10px] font-bold px-1.5 h-4 min-w-[16px] flex items-center justify-center rounded-full relative -top-1">
                        {getCartItemsCount()}
                      </span>
                    )}
                  </div>
                </MobileNavLink>
                <LogoutMobile onClick={handleLogout} />
              </>
            )}

            {/* VENDOR & STAFF MOBILE */}
            {isVendorOrStaff && (
              <>
                <UserProfileMobile
                  user={authUser}
                  role={role === "vendorOwner" ? "Owner" : "Staff"}
                />
                {/* Sirf Dashboard link bacha hai */}
                <MobileNavLink
                  to="/dashboard"
                  onClick={toggleMenu}
                  icon={<LayoutDashboard size={18} />}
                >
                  Dashboard
                </MobileNavLink>
                <LogoutMobile onClick={handleLogout} />
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

// --- Helper Components ---
const MobileNavLink = ({
  to,
  children,
  onClick,
  className = "",
  icon,
}: any) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition duration-200 ${className}`}
  >
    {icon && <span>{icon}</span>}
    {children}
  </NavLink>
);

const UserProfileMobile = ({ user, role }: any) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg mb-2 border border-gray-100">
    <div className="bg-orange-100 p-2 rounded-full text-orange-600">
      <User size={20} />
    </div>
    <div className="overflow-hidden">
      <p className="font-semibold text-gray-900 truncate">{user.name}</p>
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
