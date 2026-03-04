import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import NotFound from "../pages/NotFound";
import CreateVendor from "../pages/vendor/CreateVendor";
import CreateCategory from "../pages/vendor/CreateCategory";
import ProtectedRoute from "./ProtectedRoutes";
import GuestOrCustomerRoutes from "./GuestOrCustomerRoutes";
import CheckoutPage from "../pages/customer/CheckoutPage";
import CategoryManagementPage from "../pages/vendor/CategoryManagementPage";
import StaffManagementPage from "../pages/vendor/StaffManagementPage";
import MenuItemManagementPage from "../pages/vendor/MenuItemManagementPage";
import MainLayout from "../components/layout/MainLayout";
import VendorMenu from "../pages/customer/VendorMenu";
import NewOrdersPage from "../pages/vendor/NewOrdersPage";
import LiveOrdersPage from "../pages/vendor/LiveOrdersPage";
import PreviousOrdersPage from "../pages/vendor/PreviousOrderPage";
import MyOrdersPage from "../pages/customer/MyOrdersPage";
import DashboardLayout from "../components/layout/DashboardLayout"
import DashboardHomePage from "../pages/vendor/DashboardHomePage";
import PageUnderConstruction from "../pages/PageUnderConstruction";

const router = createBrowserRouter([
    {
        path: '/',
        element: <MainLayout />,
        errorElement: <NotFound />,
        children: [
            {
                path: '/',
                element: <HomePage />
            },

            {
                path: 'menu/:slug',
                element: (
                    <GuestOrCustomerRoutes>
                        <VendorMenu />
                    </GuestOrCustomerRoutes>
                )
            },
            {
                path: 'checkout',
                element: (
                    <GuestOrCustomerRoutes>
                        <CheckoutPage />
                    </GuestOrCustomerRoutes>
                )
            },
            {
                path: 'my-orders',
                element: (
                    <GuestOrCustomerRoutes>
                        <MyOrdersPage />
                    </GuestOrCustomerRoutes>
                )
            },  
        ]
    },

    {   
        path: "/dashboard", // 👉 Parent path set kar diya
        element: <DashboardLayout/>,
        children: [
            {
                index: true, // 👉 Ye default bacha hai. Ye direct "/dashboard" pe khulega
                element: <DashboardHomePage /> 
            },
            {
                path: 'create-vendor', // 👉 Dhyan de: Aage ka '/' hata diya hai
                element: (
                    <ProtectedRoute allowedRoles={["vendorOwner"]}>
                        <CreateVendor /> 
                    </ProtectedRoute>
                )
            },
            {
                path: 'create-category', // 👉 Yahan bhi '/' nahi hai
                element: (
                    <ProtectedRoute allowedRoles={["vendorOwner"]}>
                        <CreateCategory />
                    </ProtectedRoute>
                )
            },
            {
                path: 'category-management',
                element: (
                    <ProtectedRoute allowedRoles={["vendorOwner"]}>
                        <CategoryManagementPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'staff-management',
                element: (
                    <ProtectedRoute allowedRoles={["vendorOwner"]}>
                        <StaffManagementPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'menu-management',
                element: (
                    <ProtectedRoute allowedRoles={["vendorOwner"]}>
                        <MenuItemManagementPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'new-orders',
                element: (
                    <ProtectedRoute allowedRoles={["vendorOwner", "vendorStaff"]}>
                        <NewOrdersPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'create-orders',
                element: (
                    <ProtectedRoute allowedRoles={["vendorOwner", "vendorStaff"]}>
                        <PageUnderConstruction />
                    </ProtectedRoute>
                )
            },
            {
                path: 'live-orders',
                element: (
                    <ProtectedRoute allowedRoles={["vendorOwner", "vendorStaff"]}>
                        <LiveOrdersPage />
                    </ProtectedRoute>
                )
            },
            {
                path: 'previous-orders',
                element: (
                    <ProtectedRoute allowedRoles={["vendorOwner", "vendorStaff"]}>
                        <PreviousOrdersPage />
                    </ProtectedRoute>
                )
            }
        ]
    },

    {
        path: '/login',
        element: <LoginPage />
    },
    {
        path: '/signup',
        element: <SignupPage />
    },
    {
        path: '*',
        element: <NotFound />
    }


])

const AppRouter = () => {
    return <RouterProvider router={router} />;
}

export default AppRouter;