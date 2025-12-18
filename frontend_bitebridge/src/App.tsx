import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import AppRouter from './routes/AppRouter'
import authApi from './services/authApi';
// import reactLogo from './assets/react.svg'
import LoadingSpinner from './components/layout/LoadingSpinner';
import {WifiOff} from 'lucide-react'
// import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const { setAuthUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(true)
  const [isServerDown, setIsServerDown] = useState<boolean>(false)


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.getProfile();
        if (response.data.user) {
          setAuthUser(response.data.user);
          console.log(response.data.user);
        }
      } catch (error: any) {
        if(error.response.status >=500) setIsServerDown(true)
        console.log("User not authenticated");
        setAuthUser(null);
      }
      finally {
        setLoading(false)
      }
    }; fetchUser();
  }, [setAuthUser])

if(loading) {
  return <LoadingSpinner/>
} if(isServerDown) {
  return <>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
            <div className="bg-red-100 p-6 rounded-full mb-6 animate-pulse">
                <WifiOff size={64} className="text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Connection Lost</h1>
            <p className="text-gray-600 mb-8 max-w-md">
                Oops! It seems our server is taking a nap or your internet is down. 
                Don't worry, you are not logged out.
            </p>
            <button 
                onClick={() => window.location.reload()} 
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full shadow-lg active:scale-95 transition-all"
            >
                Retry Connection
            </button>
        </div>
  </>
}
  return ( <AppRouter/> )
}

export default App
