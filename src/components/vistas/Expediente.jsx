import React, { useState } from 'react';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineDocumentText, HiOutlineDotsVertical, HiOutlineFilter } from "react-icons/hi";
import SubirArchivo from './SubirArchivo.jsx'; // Tu componente del modal

const MiExpediente = () => {
  const [busqueda, setBusqueda] = useState("");
  
  // 1. Estado para controlar si el modal está abierto o cerrado
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Datos simulados de los archivos del docente
  const archivos = [
    { id: 1, nombre: "Planeacion_Argumentada_V1.pdf", fecha: "20/03/2026", tamano: "1.2 MB", categoria: "Planeaciones" },
    { id: 2, nombre: "Lista_Calificaciones_IDGS81.xlsx", fecha: "18/03/2026", tamano: "850 KB", categoria: "Listas" },
    { id: 3, nombre: "Acta_Tutoria_Gael.pdf", fecha: "15/03/2026", tamano: "2.1 MB", categoria: "Tutorías" },
    { id: 4, nombre: "Reporte_Individual_Enero.pdf", fecha: "10/01/2026", tamano: "1.5 MB", categoria: "Reportes" },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Encabezado con acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mi Expediente</h1>
          <p className="text-slate-500 text-sm">Gestiona y organiza tus documentos académicos oficiales.</p>
        </div>
        
        {/* 2. Al darle clic, activamos el modal */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95"
        >
          <HiOutlinePlus size={20} />
          <span>Subir Archivo</span>
        </button>
      </div>

      {/* Barra de Herramientas */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por nombre de documento..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white shadow-sm"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button className="p-2 border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50">
          <HiOutlineFilter size={20} />
        </button>
      </div>

      {/* Cuadrícula de Archivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {archivos.map((archivo) => (
          <div key={archivo.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <HiOutlineDocumentText size={30} />
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <HiOutlineDotsVertical size={20} />
              </button>
            </div>
            
            <h3 className="font-bold text-slate-700 text-sm truncate mb-1" title={archivo.nombre}>
              {archivo.nombre}
            </h3>
            <p className="text-[10px] text-emerald-600 font-bold uppercase mb-3">{archivo.categoria}</p>
            
            <div className="flex justify-between items-center text-[11px] text-slate-400 border-t pt-3">
              <span>{archivo.fecha}</span>
              <span>{archivo.tamano}</span>
            </div>

            {/* Acciones rápidas */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-white/95 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl border-t">
              <button className="flex-1 text-[11px] font-bold py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">Ver</button>
              <button className="flex-1 text-[11px] font-bold py-1 border border-slate-200 text-slate-600 rounded hover:bg-slate-50">Descargar</button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Inyectamos el componente del Modal y le pasamos las props */}
      <SubirArchivo 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
    </div>
  );
};

export default MiExpediente;