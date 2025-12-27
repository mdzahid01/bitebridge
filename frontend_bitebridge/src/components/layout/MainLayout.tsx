import { Outlet } from 'react-router-dom'
import Navbar from './NavBar'
import Footer from './Footer'
import FloatingCart from '../cart/FloatingCart'
import { useAuth } from '../../context/AuthContext'

const MainLayout = () => {
  const {authUser} = useAuth()
  const notAllowedUsers = ['vendorOwner', 'vendorStaff', 'superAdmin']
  const isRestrictedUser = authUser?.role && notAllowedUsers.includes(authUser.role);
  return (
    <div className="flex flex-col min-h-screen">
        <Navbar/>
        <main className="flex-grow">
            <Outlet/>
            {!isRestrictedUser && <FloatingCart />}
            
        </main>
        <Footer/>
    </div>
  )
}

export default MainLayout