import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import NotFound from "../pages/NotFound";
import CreateVendor from "../pages/vendor/CreateVendor";
import CreateCategory from "../pages/vendor/CreateCategory";
import ProtectedRoute from "./ProtectedRoutes";
import CategoryManagementPage from "../pages/vendor/CategoryManagementPage";
import StaffManagementPage from "../pages/vendor/StaffManagementPage";
import MenuItemManagementPage from "../pages/vendor/MenuItemManagementPage";

const router = createBrowserRouter([
    {
        path:'/',
        element: <HomePage/>
    },
    {
        path:'/create-vendor',
        element:(
            <ProtectedRoute allowedRoles={["vendorOwner"]}>
                <CreateVendor/>
            </ProtectedRoute>
        )
    },
    {
        path:'/create-category',
        element:(
            <ProtectedRoute allowedRoles={["vendorOwner"]}>
                <CreateCategory/>
            </ProtectedRoute>
        )
    },
    {
        path:'/category-management',
        element:(
            <ProtectedRoute allowedRoles={["vendorOwner"]}>
                <CategoryManagementPage/>
            </ProtectedRoute>
        )
    },
    {
        path:'/staff-management',
        element:(
            <ProtectedRoute allowedRoles={["vendorOwner"]}>
                <StaffManagementPage/>
            </ProtectedRoute>
        )
    },
    {
        path:'/menu-management',
        element:(
            <ProtectedRoute allowedRoles={["vendorOwner"]}>
                <MenuItemManagementPage/>
            </ProtectedRoute>
        )
    },
    {
        path:'/login',
        element: <LoginPage/>
    },
    {
        path:'/signup',
        element: <SignupPage/>
    },
    {
        path:'*',
        element: <NotFound/>
    }
    
])

const AppRouter = ()=>{
    return <RouterProvider router ={router}/>;
}

export default AppRouter;