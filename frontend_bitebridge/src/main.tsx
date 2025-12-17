import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthProvider from './context/AuthContext.tsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
       <Toaster 
          position="bottom-center"
          reverseOrder={false}
          toastOptions={{
            // Global styling (sare toasts ke liye)
            style: {
              fontSize: '16px',
              padding: '5px',
              minWidth: '300px',
              borderRadius: '10px',
            },
          }}
        />
    </AuthProvider>
  </StrictMode>,
)
