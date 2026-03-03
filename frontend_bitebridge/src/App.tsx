import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import AppRouter from './routes/AppRouter'
import authApi from './services/authApi';
// import reactLogo from './assets/react.svg'
import LoadingSpinner from './components/layout/LoadingSpinner';
import { WifiOff ,RotateCcw,X} from 'lucide-react'
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
          // console.log(response.data.user);
        }
      } catch (error: any) {
        console.error("Error details:", error); // Debugging ke liye

        // CASE 1: Server OFF hai ya Internet nahi hai (Network Error)
        // Is case mein 'response' undefined hota hai
        if (!error.response) {
          console.log("Network Error / Server Unreachable");
          setIsServerDown(true);
        }
        // CASE 2: Server connect hua par 500+ Error bheja
        else if (error.response.status >= 500) {
          console.log("Server Error 500+");
          setIsServerDown(true);
        }
        // CASE 3: Auth Failed (401/403 etc)
        else {
          console.log("User not authenticated");
          setAuthUser(null);
        }
      }
      // finally block waisa hi rahega
      finally {
        setLoading(false);
      }
    }; fetchUser();
  }, [setAuthUser])

  if (loading) {
    return <LoadingSpinner />}
  // } if (isServerDown) {
  //   return <>
  //     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
  //       <div className="bg-red-100 p-6 rounded-full mb-6 animate-pulse">
  //         <WifiOff size={64} className="text-red-500" />
  //       </div>
  //       <h1 className="text-3xl font-bold text-gray-800 mb-2">Connection Lost</h1>
  //       <p className="text-gray-600 mb-8 max-w-md">
  //         Oops! It seems our server is taking a nap or your internet is down.
  //         Don't worry, you are not logged out.
  //       </p>
  //       <button
  //         onClick={() => window.location.reload()}
  //         className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-full shadow-lg active:scale-95 transition-all"
  //       >
  //         Retry Connection
  //       </button>
  //       {/* <a href="/">Home</a> */}
  //     </div>
  //   </>
  // }
  return (<>
  {isServerDown && (
        <div className="bg-red-600 top-0 left-0 w-full z-[9999] text-white px-4 shadow-lg flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <WifiOff size={20} />
            <span className="font-medium">
              Server unreachable. You are in offline mode.
            </span>
            <button
              onClick={() => window.location.reload()}
              className=" text-white font-bold py-3 px-3 rounded active:scale-95 transition-all hover:-rotate-360 "
            >
                <RotateCcw size={20} />
            </button>
          </div>
          <button 
            onClick={() => setIsServerDown(false)} // User isse close kar sakta hai
            className="bg-white/20 hover:bg-white/30 rounded-full p-1 text-sm transition"
          >
           <X  size={20} />
          </button>
        </div>
      )}
  <AppRouter />
  </>)
}

export default App
