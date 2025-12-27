import React from 'react'
import { useAuth } from '../context/AuthContext'
import type { userRole } from '../types/user.types'
import { Navigate } from 'react-router-dom'

const GuestOrCustomerRoutes = ({children}:{children: React.ReactNode}) => {
  const {authUser} = useAuth()
  const restrictedRoles : userRole[] = ['vendorOwner','vendorStaff', "superAdmin"]
  
  if(authUser && restrictedRoles.includes(authUser.role))
  {
    console.log(`Access Denied for ${authUser.role}. Redirecting to Home.`);
      // Unhe Homepage ya Dashboard par bhej do
      return <Navigate to="/" replace />;
  }
  return <>{children}</>
}


export default GuestOrCustomerRoutes
