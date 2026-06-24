import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import App from './App'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-center"
          toastOptions={{
            duration: 3500,
            style: { background: '#162236', color: '#E8EFF5', border: '1px solid #1E3048', borderRadius: '8px', fontSize: '0.875rem' },
            success: { iconTheme: { primary: '#00C896', secondary: '#0D1B2A' } },
            error:   { iconTheme: { primary: '#E05252', secondary: '#0D1B2A' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
