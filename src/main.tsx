/// <reference types="vite/client" />
import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './Home';
import Admin from './admin';
import Learn from './Learn';
import './learning.css';
import './styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode>{window.location.pathname.startsWith('/admin')?<Admin/>:window.location.pathname.startsWith('/learn')?<Learn/>:<Home/>}</React.StrictMode>);

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
 navigator.serviceWorker.register('/sw.js').catch(error => console.warn('App install support could not start:',error.message));
}
