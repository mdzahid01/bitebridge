import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import AppRouter from './routes/AppRouter'
import authApi from './services/authApi';
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const { setAuthUser } = useAuth();
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.getProfile();
        if (response.data.user) {
          setAuthUser(response.data.user);
          console.log(response.data.user);
        }
      } catch (error: any) {
        console.log("User not authenticated");
        setAuthUser(null);
      }
      finally {
        setLoading(false)
      }
    }; fetchUser();
  }, [setAuthUser])

if(loading) {
  return <div>Loading....</div>
}
  return (
    <AppRouter/>
  )
}

export default App
