import React, { useState, useEffect } from 'react';
import { HiOutlineDocumentText, HiOutlineCloudUpload, HiOutlineCheckCircle, HiOutlineClock } from "react-icons/hi";
import SubirArchivo from './SubirArchivo.jsx'; // Tu componente del modal
import { supabase } from '../../lib/supabase'; // Importación de Supabase

const PanelDashboard = () => {

  // 1. Estado para controlar si el modal está abierto o cerrado
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para guardar los documentos reales de la BD
  const [documentos, setDocumentos] = useState([]);
  const [descargandoId, setDescargandoId] = useState(null);

  // Efecto para obtener los datos al cargar el Dashboard
  useEffect(() => {
    let activo = true;

    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: perfil } = await supabase
            .from('usuario')
            .select('usuarioid')
            .eq('uid_fk', user.id)
            .single();

          if (perfil) {
            // Traemos TODOS los documentos del usuario para hacer los cálculos
            const { data, error } = await supabase
              .from('DOCUMENTO')
              .select('*')
              .eq('usuarioFK', perfil.usuarioid)
              .order('fecha', { ascending: false });

            if (!activo) return;
            if (error) console.error("Error al obtener documentos para dashboard:", error);
            else setDocumentos(data || []);
          }
        }
      } catch (err) {
        console.error("Error general en dashboard:", err);
      }
    };

    fetchData();
    return () => { activo = false; };
  }, []);

  // Función para recargar la tabla después de subir un archivo nuevo
  const recargar = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: perfil } = await supabase
            .from('usuario')
            .select('usuarioid')
            .eq('uid_fk', user.id)
            .single();

          if (perfil) {
            const { data, error } = await supabase
              .from('DOCUMENTO')
              .select('*')
              .eq('usuarioFK', perfil.usuarioid)
              .order('fecha', { ascending: false });

            if (!error) setDocumentos(data || []);
          }
        }
      } catch (err) {
        console.error("Error al recargar dashboard:", err);
      }
  };

  // Función para descargar desde la tabla
  const forzarDescarga = async (url, nombreOriginal, id) => {
    try {
      setDescargandoId(id); 
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const extension = url.split('.').pop().split('?')[0]; 
      link.download = `${nombreOriginal || 'Documento'}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl); 
    } catch (error) {
      console.error("Error al descargar:", error);
      alert("Hubo un problema al intentar descargar el archivo.");
    } finally {
      setDescargandoId(null);
    }
  };

  // Cálculos dinámicos para las Cards
  const totalDocs = documentos.length;
  
  // Calculamos los subidos hoy (comparando solo la fecha, sin horas)
  const fechaHoy = new Date().toLocaleDateString();
  const subidosHoy = documentos.filter(doc => new Date(doc.fecha).toLocaleDateString() === fechaHoy).length;
  
  const validados = documentos.filter(doc => doc.estado === 'Validado').length;
  const pendientes = documentos.filter(doc => doc.estado === 'Pendiente').length;

  // Datos dinámicos para las Cards (reemplazando los simulados)
  const stats = [
    { label: "Total Documentos", value: totalDocs.toString(), icon: <HiOutlineDocumentText size={24}/>, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Subidos hoy", value: subidosHoy.toString(), icon: <HiOutlineCloudUpload size={24}/>, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Validados", value: validados.toString(), icon: <HiOutlineCheckCircle size={24}/>, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Pendientes", value: pendientes.toString(), icon: <HiOutlineClock size={24}/>, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  // Obtenemos solo los 5 más recientes para la Tabla
  const recentFiles = documentos.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header de Bienvenida */}
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Panel de Control Académico</h1>
        <p className="text-slate-500 text-sm">Universidad Tecnológica de Nayarit - Periodo ENE-ABR 2026</p>
      </header>

      {/* Sección de Cards  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 cursor-pointer">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white  hover:bg-gray-100 p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabla de Archivos Recientes  */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700">Documentos Recientes</h2>
          <button className="text-emerald-600 text-sm font-bold hover:underline cursor-pointer">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 font-semibold">Nombre</th>
                <th className="px-6 py-3 font-semibold">Tipo</th>
                <th className="px-6 py-3 font-semibold">Fecha</th>
                <th className="px-6 py-3 font-semibold">Estatus</th>
                <th className="px-6 py-3 font-semibold text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentFiles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-sm">
                    No hay documentos recientes.
                  </td>
                </tr>
              ) : (
                recentFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {file.nombre || file.archivo?.split('/').pop() || "Documento"}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold uppercase">{file.tipo}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(file.fecha).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full 
                        ${file.estado === 'Validado' ? 'bg-emerald-100 text-emerald-700' : 
                          file.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 
                          file.estado === 'Rechazado' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {file.estado || 'Pendiente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => forzarDescarga(file.archivo, file.nombre, file.id)}
                        disabled={descargandoId === file.id}
                        className="text-emerald-600 hover:text-emerald-800 font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        {descargandoId === file.id ? 'Descargando...' : 'Descargar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Botón Flotante de Subida (Opcional - Usabilidad)  */}
      <button className="fixed bottom-8 right-8 bg-emerald-600 text-white p-4 rounded-full shadow-xl hover:bg-emerald-700 hover:scale-110 transition-all group"
        onClick={() => setIsModalOpen(true)}>
        <HiOutlineCloudUpload size={28} />
        <span className="absolute right-full mr-3 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Subir nuevo documento
        </span>
      </button>

      {/* 3. Inyectamos el componente del Modal y le pasamos las props */}
      <SubirArchivo 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUploadSuccess={recargar} // Agregamos esto para que refresque al subir
      />

    </div>
    
  );
};

export default PanelDashboard;