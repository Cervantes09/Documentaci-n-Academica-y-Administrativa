import React, { useState } from 'react';
import { HiOutlineCloudUpload, HiOutlineX, HiOutlineDocumentText } from "react-icons/hi";

const SubirArchivo = ({ isOpen, onClose }) => {
  // Estados para gestionar el formulario
  const [archivo, setArchivo] = useState(null);
  const [periodo, setPeriodo] = useState("");
  const [tipo, setTipo] = useState("");

  // Lista de periodos académicos (Punto 5.1: Organización)
  const periodos = ["ENE-ABR 2026", "MAY-AGO 2026", "SEP-DIC 2026"];
  // Tipos de documentos (Catalogado)
  const tiposDocumentos = ["Planeación Docente", "Lista de Asistencia", "Acta de Academia", "Reporte Final"];

  // Si el modal no está abierto, no renderizamos nada
  if (!isOpen) return null;

  // Función simulada para "Subir" (Punto 6.2: Interacción)
  const handleFormulario = (e) => {
    e.preventDefault();
    console.log("Subiendo archivo:", archivo.name, "Periodo:", periodo, "Tipo:", tipo);
    // Aquí iría la conexión con Supabase Storage luego
    
    // Limpiamos y cerramos
    setArchivo(null);
    setPeriodo("");
    setTipo("");
    onClose(); 
  };

  return (
    // Fondo oscuro con desenfoque
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      
      {/* Contenedor del Modal */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative border border-slate-100">
        
        {/* Botón de Cerrar (Punto 6.1: Usabilidad) */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-emerald-600 transition-colors"
        >
          <HiOutlineX size={20} />
        </button>

        {/* Encabezado */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineCloudUpload className="text-emerald-600" size={24}/>
            Subir Nuevo Documento
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Completa los datos para integrar el archivo a tu expediente.
          </p>
        </div>

        {/* Formulario (Punto 1.4: Validación) */}
        <form onSubmit={handleFormulario} className="p-6 space-y-5">
          
          {/* Campo: Periodo Académico */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-600">Periodo Académico:</label>
            <select 
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)} 
              required
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="" disabled>Selecciona un periodo</option>
              {periodos.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Campo: Tipo de Documento */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-600">Tipo de Documento:</label>
            <select 
              value={tipo} 
              onChange={(e) => setTipo(e.target.value)} 
              required
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="" disabled>Selecciona tipo</option>
              {tiposDocumentos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Campo: Zona de Arrastre de Archivo (Simulada) */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-600">Archivo (PDF o Word max. 10MB):</label>
            <div 
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors 
                ${archivo ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'}`}
            >
              <input 
                type="file" 
                onChange={(e) => setArchivo(e.target.files[0])} 
                className="sr-only" // Ocultamos el input feo
                id="file-input"
                accept=".pdf,.doc,.docx" // Validación de formato (Punto 1.4)
                required
              />
              <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-3">
                {archivo ? (
                  <>
                    <HiOutlineDocumentText size={40} className="text-emerald-600" />
                    <p className="text-sm font-bold text-slate-700">{archivo.name}</p>
                    <p className="text-xs text-slate-500">{(archivo.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <HiOutlineCloudUpload size={40} className="text-slate-400" />
                    <p className="text-sm font-medium text-slate-600">Arrastra tu archivo aquí o <span className="text-emerald-600 font-bold">búscalo</span>.</p>
                    <p className="text-xs text-slate-400">Sólo formatos oficiales.</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Acciones (Punto 6.2: Interacción) */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 text-sm font-bold text-slate-600 rounded-lg border hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-md"
            >
              Subir Archivo
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default SubirArchivo;