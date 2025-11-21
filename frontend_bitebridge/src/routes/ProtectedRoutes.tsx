import { Navigate,useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type userRole } from "../types/user.types";

type ProtectedRouteProps = {
    allowedRole: userRole,
    children: React.ReactElement
};

const ProtectedRoute = ({allowedRole,children}:ProtectedRouteProps)=>{
    const {authUser} = useAuth();
    const location = useLocation()

    if(!authUser){
        return <Navigate to="/login" state={{from: location}} replace />
    }

    if(authUser.role === allowedRole){
        return children
    }
    console.log("vendorOwner id se login kr bachcha")
    return <Navigate to='/' replace />
}

export default ProtectedRoute