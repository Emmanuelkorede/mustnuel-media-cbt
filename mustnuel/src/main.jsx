import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import { registerSW } from 'virtual:pwa-register'; // 1. Import the PWA registration helper

import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext.jsx';

import './index.css'
import App from './App.jsx'
import 'katex/dist/katex.min.css';

// 2. Automatically register service worker for background network states
if ('serviceWorker' in navigator) {
  registerSW({ immediate: true });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>

            <App />

        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)