import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { SessionProvider } from './context/dataSesionUsuario';
import App from './App.jsx'

// Eliminamos "ReactDOM" y "React.", usamos directamente createRoot y StrictMode
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </StrictMode>
);