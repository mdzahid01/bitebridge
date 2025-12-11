import { Navigate,useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { type userRole } from "../types/user.types";

type ProtectedRouteProps = {
    allowedRoles: userRole[],
    children: React.ReactElement
};

const ProtectedRoute = ({allowedRoles,children}:ProtectedRouteProps)=>{
    const {authUser} = useAuth();
    const location = useLocation()

    if(!authUser){
        return <Navigate to="/login" state={{from: location}} replace />
    }

    if(allowedRoles.includes(authUser.role)){
        return children
    }
    console.log("vendorOwner id se login kr bachcha")
    return <Navigate to='/' replace />
}

export default ProtectedRoute