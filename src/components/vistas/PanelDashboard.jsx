import React, { useState } from 'react';
import { HiOutlineDocumentText, HiOutlineCloudUpload, HiOutlineCheckCircle, HiOutlineClock } from "react-icons/hi";
import SubirArchivo from './SubirArchivo.jsx'; // Tu componente del modal

const PanelDashboard = () => {

  // 1. Estado para controlar si el modal está abierto o cerrado
    const [isModalOpen, setIsModalOpen] = useState(false);

  // Datos simulados para las Cards 
  const stats = [
    { label: "Total Documentos", value: "12", icon: <HiOutlineDocumentText size={24}/>, color: "text-blue-600", bg: "bg-blue-100" },
    { label: "Subidos hoy", value: "2", icon: <HiOutlineCloudUpload size={24}/>, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: "Validados", value: "9", icon: <HiOutlineCheckCircle size={24}/>, color: "text-purple-600", bg: "bg-purple-100" },
    { label: "Pendientes", value: "3", icon: <HiOutlineClock size={24}/>, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  // Datos simulados para la Tabla
  const recentFiles = [
    { id: 1, name: "Planeacion_Enero_2026.pdf", type: "PDF", date: "2026-03-15", status: "Validado" },
    { id: 2, name: "Lista_Asistencia_IDGS81.xlsx", type: "EXCEL", date: "2026-03-18", status: "Pendiente" },
    { id: 3, name: "Acta_Academia_Marzo.pdf", type: "PDF", date: "2026-03-19", status: "En Revisión" },
  ];

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
              {recentFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{file.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold">{file.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{file.date}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full 
                      ${file.status === 'Validado' ? 'bg-emerald-100 text-emerald-700' : 
                        file.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {file.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-emerald-600 hover:text-emerald-800 font-bold text-xs cursor-pointer">Descargar</button>
                  </td>
                </tr>
              ))}
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
      />

    </div>
    
  );
};

export default PanelDashboard;