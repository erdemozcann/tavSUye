import React from 'react'
import ReactDOM from 'react-dom/client'
import FallbackPage from './pages/FallbackPage'
import './index.css'

// Get the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element (#root) not found in the DOM');
}

// Render the fallback UI
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <FallbackPage />
  </React.StrictMode>
); 