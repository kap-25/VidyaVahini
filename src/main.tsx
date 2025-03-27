
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// PWA registration function
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });
      
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

// Initialize app
const mountApp = () => {
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
  
  // Register service worker for production
  if (import.meta.env.PROD) {
    registerServiceWorker();
  }
};

mountApp();
