import React from 'react';
import { HiOutlineX } from "react-icons/hi";

const VistaArchivo = ({ archivo, onClose }) => {
  if (!archivo) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden relative">
        
        {/* Cabecera del Visor */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{archivo.nombre || "Documento"}</h3>
            <p className="text-xs text-slate-500 font-medium uppercase">{archivo.tipo}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Cerrar visor"
          >
            <HiOutlineX size={24} />
          </button>
        </div>

        {/* Contenedor del Iframe */}
        <div className="flex-1 w-full bg-slate-200 relative">
          {/* Usamos un iframe para renderizar el PDF nativamente en el navegador */}
          <iframe 
            src={archivo.archivo} 
            className="w-full h-full border-none"
            title={archivo.nombre || "Visor de Documento"}
          />
        </div>

      </div>
    </div>
  );
};

export default VistaArchivo;