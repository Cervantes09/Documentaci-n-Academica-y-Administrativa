import React, { useState } from 'react';
import { HiOutlineDownload, HiOutlineSearch, HiOutlineDocumentText, HiOutlineFolderOpen } from "react-icons/hi";
import { BiFileBlank } from "react-icons/bi";

const FormatosUT = () => {
  const [busqueda, setBusqueda] = useState("");

  // Datos simulados de formatos oficiales (Punto 5.1: Organización)
  const formatos = [
    { id: 1, nombre: "F-AC-01 Planeación Didáctica", tipo: "Word", categoria: "Académico", ultimaVersion: "2024-B" },
    { id: 2, nombre: "F-TU-03 Reporte de Tutoría Individual", tipo: "PDF", categoria: "Tutorías", ultimaVersion: "2025-A" },
    { id: 3, nombre: "F-ES-05 Registro de Proyecto Estadía", tipo: "Word", categoria: "Estadías", ultimaVersion: "2024-C" },
    { id: 4, nombre: "F-AC-10 Acta de Academia", tipo: "PDF", categoria: "Académico", ultimaVersion: "2025-A" },
    { id: 5, nombre: "F-VI-02 Carta de Presentación", tipo: "Word", categoria: "Vinculación", ultimaVersion: "2023-B" },
  ];

  // Filtro de búsqueda (Punto 1.3: Búsqueda)
  const formatosFiltrados = formatos.filter(f => 
    f.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    f.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Formatos Oficiales UT</h1>
        <p className="text-slate-500 text-sm">Descarga las plantillas vigentes para la gestión académica y administrativa.</p>
      </div>

      {/* Barra de Búsqueda */}
      <div className="relative max-w-md">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar formato o categoría..." 
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white shadow-sm transition-all"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista de Formatos (Punto 5.2: Componentes visuales) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Documento</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Categoría</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Tipo</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Versión</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {formatosFiltrados.length > 0 ? (
              formatosFiltrados.map((formato) => (
                <tr key={formato.id} className="hover:bg-emerald-50/30 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                        <BiFileBlank size={20} />
                      </div>
                      <span className="text-sm font-semibold text-slate-700">{formato.nombre}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-500 rounded-full font-medium italic">
                      {formato.categoria}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      formato.tipo === 'PDF' ? 'border-red-200 text-red-600 bg-red-50' : 'border-blue-200 text-blue-600 bg-blue-50'
                    }`}>
                      {formato.tipo}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-slate-400 font-mono">{formato.ultimaVersion}</td>
                  <td className="p-4 text-right">
                    <button className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 cursor-pointer font-bold text-sm transition-colors p-2 hover:bg-emerald-50 rounded-lg">
                      <HiOutlineDownload size={18} />
                      <span className="hidden sm:inline">Descargar</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-12 text-center text-slate-400 italic">
                  No se encontraron formatos que coincidan con tu búsqueda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Aviso de Actualización */}
      <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
        <HiOutlineFolderOpen className="text-emerald-600" size={24} />
        <p className="text-xs text-emerald-800 leading-snug">
          <b>Nota:</b> Estos formatos son los oficiales proporcionados por Calidad. Si necesitas un formato que no aparece aquí, por favor contactate con Lupita.
        </p>
      </div>
    </div>
  );
};

export default FormatosUT;