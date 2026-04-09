import React from 'react';
import { HiOutlineX, HiOutlineDocumentText } from "react-icons/hi"; // Añadí un ícono más para el diseño

const VistaArchivo = ({ archivo, onClose }) => {
  if (!archivo) return null;

  return (
    // Fondo más inmersivo con un desenfoque un poco más suave
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 z-[60] transition-opacity">
      
      {/* Contenedor principal con sombra masiva para dar profundidad */}
      <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative ring-1 ring-white/10">
        
        {/* Cabecera del Visor - Diseño tipo "App" */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-4">
            {/* Ícono decorativo a la izquierda del título */}
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <HiOutlineDocumentText size={24} />
            </div>
            
            <div>
              <h3 className="font-bold text-slate-800 text-xl tracking-tight line-clamp-1">
                {archivo.nombre || "Documento"}
              </h3>
              {/* El tipo de documento ahora es un 'Badge' (pastillita) elegante */}
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-widest">
                  {archivo.tipo}
                </span>
              </div>
            </div>
          </div>

          {/* Botón de cerrar con animación de giro en el hover y color sólido */}
          <button 
            onClick={onClose} 
            className="group p-2.5 cursor-pointer text-slate-400 hover:text-white hover:bg-red-500 rounded-xl transition-all duration-200 active:scale-95"
            title="Cerrar visor"
          >
            <HiOutlineX size={22} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>

        {/* Contenedor del Iframe */}
        <div className="flex-1 w-full bg-slate-100/80 relative shadow-inner p-3 sm:p-5">
          {/* El iframe ahora tiene bordes redondeados y su propia sombra para parecer un papel sobre un escritorio */}
          <div className="w-full h-full rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
            <iframe 
              src={archivo.archivo} 
              className="w-full h-full border-none"
              title={archivo.nombre || "Visor de Documento"}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default VistaArchivo;