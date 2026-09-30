import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// PWA Service Worker Registration
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
