import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSession } from './context/dataSesionUsuario';

// Importación de Componentes y Vistas
import Layout from './components/Layout';
import Login from './components/vistas/Login';
import PanelDashboard from './components/vistas/PanelDashboard';
import MiExpediente from './components/vistas/Expediente.jsx';
import FormatosUT from './components/vistas/FormatosUT.jsx';
import Academia from './components/vistas/Academia.jsx';
import PantallaEspera from './components/vistas/PantallaEspera';
import AdminDirector from './components/vistas/AdminDirector';
import AdminDocs from './components/vistas/AdminDocs';
import SubirArchivo from './components/vistas/SubirArchivo';

function App() {
  const { sesion, datosUsuario, cargando } = useSession();
  const rol = datosUsuario?.tipousuario;

  // 1. SI ESTÁ CARGANDO: Mostramos el spinner
  if (cargando) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* ESCENARIO 1: NO HAY SESIÓN */}
        {!sesion ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        ) : (
          /* ESCENARIO 2: HAY SESIÓN PERO ESPERAMOS EL ROL */
          /* Si no hay datosUsuario todavía, mostramos carga para evitar saltos de ruta */
          !datosUsuario ? (
            <Route path="*" element={
              <div className="h-screen w-full flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            } />
          ) : (
            /* ESCENARIO 3: YA TENEMOS SESIÓN Y ROL */
            <>
              {/* CASO A: USUARIO PENDIENTE */}
              {rol === 'pendiente' ? (
                <>
                  <Route path="/espera" element={<PantallaEspera />} />
                  <Route path="*" element={<Navigate to="/espera" replace />} />
                </>
              ) : (
                /* CASO B: ACCESO AUTORIZADO (RBAC) */
                <Route path="/" element={<Layout />}>
                  
                  {/* --- RUTAS DOCENTE --- */}
                  {rol === 'docente' && (
                    <>
                      <Route index element={<PanelDashboard />} />
                      <Route path="expediente" element={<MiExpediente />} />
                      <Route path="academia" element={<Academia />} />
                      <Route path="formatos" element={<FormatosUT />} />
                      <Route path="subir" element={<SubirArchivo />} />
                    </>
                  )}

                  {/* --- RUTAS ADMINISTRATIVO --- */}
                  {rol === 'administrativo' && (
                    <>
                      <Route index element={<Academia />} />
                      <Route path="gestion-documentos" element={<AdminDocs />} />
                      <Route path="formatos" element={<FormatosUT />} />
                      <Route path="expediente" element={<MiExpediente />} />
                    </>
                  )}

                  {/* --- RUTAS DIRECTOR --- */}
                  {rol === 'director' && (
                    <>
                      <Route index element={<AdminDirector />} />
                      <Route path="academia" element={<Academia />} />
                      <Route path="gestion-documentos" element={<AdminDocs />} />
                      <Route path="formatos" element={<FormatosUT />} />
                      <Route path="expediente" element={<MiExpediente />} />
                    </>
                  )}

                  {/* Ruta común y manejo de errores dentro del dashboard */}
                  <Route path="configuracion" element={<div className="p-8">Configuración</div>} />
                  
                  {/* ESTA ES LA SALIDA: Si intenta entrar a una ruta que no es de su rol, 
                      lo regresa al index de su panel en lugar de quedarse trabado */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              )}
            </>
          )
        )}
      </Routes>
    </Router>
  );
}

export default App;