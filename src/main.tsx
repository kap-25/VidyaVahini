
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Check for internet connection
const checkOnlineStatus = () => {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CONNECTIVITY_CHANGE',
      isOnline: navigator.onLine
    });
  }
};

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
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            if (window.confirm('New version available! Update now?')) {
              registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};

// Handle beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e: Event) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Store the event so it can be triggered later
  window.deferredPrompt = e as BeforeInstallPromptEvent;
});

// Add online/offline event listeners
window.addEventListener('online', checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);

// Initialize app
const mountApp = () => {
  const root = createRoot(document.getElementById("root")!);
  root.render(<React.StrictMode><App /></React.StrictMode>);
  
  // Register service worker
  registerServiceWorker();
};

mountApp();
