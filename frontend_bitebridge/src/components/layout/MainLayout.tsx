import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './NavBar'
import Footer from './Footer'
import FloatingCart from '../cart/FloatingCart'
import { useAuth } from '../../context/AuthContext'

const MainLayout = () => {
  const {authUser} = useAuth()
  const location = useLocation()
  const notAllowedUsers = ['vendorOwner', 'vendorStaff', 'superAdmin']
  const isRestrictedUser = authUser?.role && notAllowedUsers.includes(authUser.role);
  // agar checkout page me hi hain to checkout bar dikhane ki zarurat hi nahi
  const isCheckoutPage = location.pathname === '/checkout';
  console.log("location: ", location)
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar/>
        <main className="flex-grow">
            <Outlet/>
            {(!isRestrictedUser && !isCheckoutPage) && <FloatingCart />}
            
        </main>
        {/* {!isRestrictedUser && <Footer />} */}
        {/* <Footer/> */}
    </div>
  )
}

export default MainLayout