import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from './Home';
import Admin from './admin';
import './styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode>{window.location.pathname.startsWith('/admin')?<Admin/>:<Home/>}</React.StrictMode>);
