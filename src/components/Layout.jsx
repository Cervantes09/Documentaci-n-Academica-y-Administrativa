import React from 'react';
import { Outlet } from 'react-router-dom'; 
import MenuLateral from './MenuLateral';

// Si no estás usando AdminDocs y AdminDirector directamente aquí, 
// puedes borrar sus importaciones para mantener tu código limpio.
import AdminDocs from './vistas/AdminDocs';
import AdminDirector from './vistas/AdminDirector';

const Layout = () => {
  return (
    // flex-col (celular) -> md:flex-row (escritorio)
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 overflow-hidden">
      
      <MenuLateral />
      
      {/* flex-1 toma el resto del espacio disponible, overflow-y-auto permite scroll solo aquí */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto relative">
        {/* Aquí React Router pone la vista según la URL */}
        <Outlet />
      </main>
      
    </div>
  );
};

export default Layout;