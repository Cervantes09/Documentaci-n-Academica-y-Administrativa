import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './components/vistas/Login';
import PanelDashboard from './components/vistas/PanelDashboard';
import MiExpediente from './components/vistas/Expediente.jsx';
import FormatosUT from './components/vistas/FormatosUT.jsx';
import Academia from './components/vistas/Academia.jsx';

function App() {
  // Mantienes tu lógica de login (Punto 6.2 de la lista)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        {/* RUTA DE LOGIN: Si ya está logueado, lo manda al inicio */}
        <Route 
          path="/login" 
          element={!isLoggedIn ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
        />

        {/* RUTAS PROTEGIDAS: Solo entran si isLoggedIn es true */}
        <Route 
          path="/" 
          element={isLoggedIn ? <Layout /> : <Navigate to="/login" />}
        >
          {/* Aquí defines qué componente se inyecta en el <Outlet /> del Layout */}
          <Route index element={<PanelDashboard />} />
          <Route path="expediente" element={<MiExpediente />} />
          <Route path="formatos" element={<FormatosUT />} />
          <Route path="academia" element={<Academia />} />
          
          {/* Configuración (puedes crear el componente luego) */}
          <Route path="configuracion" element={<div className="p-8"><h2>Configuración en construcción...</h2></div>} />
        </Route>

        {/* Comodín: Cualquier otra ruta manda al inicio o login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;