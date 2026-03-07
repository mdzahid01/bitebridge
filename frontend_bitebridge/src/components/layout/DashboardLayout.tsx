import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
    Tags, 
    MenuSquare, 
    Users, 
    PlusCircle, 
    ShoppingBag, 
    Activity, 
    History,
    Menu,
    House,
    Store
} from 'lucide-react';

const DashboardLayout = () => {
    const { authUser } = useAuth();
    const role = authUser?.role;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const getNavLinkClass = ({ isActive }:{isActive: boolean}) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
            isActive 
                ? "bg-orange-600 text-white shadow-md" 
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
        }`;

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        // 🔥 CHANGE 1: min-h ki jagah exact 'h-[calc(100vh-64px)]' aur 'overflow-hidden' lagaya
        <div className="fixed top-0 left-0 right-0 bottom-0 flex bg-gray-50 overflow-hidden z-30">
            
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="absolute inset-0 bg-black/50 z-40 lg:hidden" 
                    onClick={toggleSidebar}
                ></div>
            )}

            {/* --- SIDEBAR --- */}
            {/* 🔥 CHANGE 2: fixed/sticky ki jagah 'absolute lg:static' aur 'h-full' */}
            <aside className={`absolute lg:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
                isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
            }`}>
                {/* Sidebar Scrollable Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    <NavLink to="/dashboard/" end className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                        <House size={20} /> Home
                    </NavLink>
                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-2">
                        Main Menu
                    </p>
                    <NavLink to="/dashboard/live-orders" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                        <Activity size={20} /> Live Orders
                    </NavLink>
                    <NavLink to="/dashboard/new-orders" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                        <ShoppingBag size={20} /> New Orders
                    </NavLink>
                    <NavLink to="/dashboard/create-orders" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                        <PlusCircle size={20} /> Create Order
                    </NavLink>
                    <NavLink to="/dashboard/previous-orders" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                        <History size={20} /> Order History
                    </NavLink>

                    {role === 'vendorOwner' && (
                        <>
                            <div className="my-4 border-t border-gray-100"></div>
                            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-4">
                                Management
                            </p>
                            <NavLink to="/dashboard/category-management" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                                <Tags size={20} /> Categories
                            </NavLink>
                            <NavLink to="/dashboard/menu-management" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                                <MenuSquare size={20} /> Menu Items
                            </NavLink>
                            <NavLink to="/dashboard/staff-management" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                                <Users size={20} /> Staff Management
                            </NavLink>
                            
                            <div className="my-4 border-t border-gray-100"></div>
                            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 mt-4">
                                Vendor
                            </p>
                            <NavLink to="/dashboard/vendor-details" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                                <Store size={20} /> Vendor Details
                            </NavLink>
                            {/* <NavLink to="/dashboard/menu-management" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                                <MenuSquare size={20} /> Menu Items
                            </NavLink>
                            <NavLink to="/dashboard/staff-management" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                                <Users size={20} /> Staff Management
                            </NavLink>
                            <NavLink to="/dashboard/menu-management" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                                <MenuSquare size={20} /> Menu Items
                            </NavLink>
                            <NavLink to="/dashboard/staff-management" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                                <Users size={20} /> Staff Management
                            </NavLink> */}
                        </>
                    )}
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            {/* 🔥 CHANGE 3: flex-1 ke sath 'h-full overflow-hidden' taaki ye parent cross na kare */}
            <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                
                {/* Mobile Toggle Button */}
                <div className="lg:hidden bg-white p-4 flex items-center gap-3 border-b border-gray-200 shadow-sm flex-shrink-0">
                    <button onClick={toggleSidebar} className="p-1 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-gray-800">Vendor Dashboard</span>
                </div>

                {/* 🔥 CHANGE 4: Asli scroll yahan hoga (overflow-y-auto) */}
                {/* Dashboard Page Content loads here */}
                <div className="flex-1 overflow-y-auto bg-gray-50 relative custom-scrollbar">
                    <Outlet />
                </div>
            </main>

        </div>
    );
};

export default DashboardLayout;