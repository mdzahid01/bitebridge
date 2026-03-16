import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthProvider from './context/AuthContext.tsx'
import { Toaster } from 'react-hot-toast'
import { CartProvider } from './context/CartContext.tsx'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
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
            success: {
              duration: 3000, // 3 second baad gayab hoga
              style: {
                background: '#ecfdf5', // Light green background (Tailwind green-50)
                color: '#065f46',      // Dark green text (Tailwind green-900)
                border: '1px solid #10b981', // Green border
              },
              iconTheme: {
                primary: '#10b981', // Tick icon ka color
                secondary: '#ecfdf5', // Icon ke background ka color
              },
            },
            error: {
              duration: 4000, // Error ko thoda zyada der dikhate hain (4 sec)
              style: {
                background: '#fef2f2', // Light red background (Tailwind red-50)
                color: '#991b1b',      // Dark red text (Tailwind red-900)
                border: '1px solid #ef4444', // Red border
              },
              iconTheme: {
                primary: '#ef4444', // Cross icon ka color
                secondary: '#fef2f2',
              },
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)
