import React from 'react';
import { Outlet } from 'react-router-dom'; // IMPORTANTE
import MenuLateral from './MenuLateral';
import AdminDocs from './vistas/AdminDocs';

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <MenuLateral />
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {/* Aquí React Router pone la vista según la URL */}
        <Outlet /> 
      </main>
    </div>
  );
};

export default Layout;