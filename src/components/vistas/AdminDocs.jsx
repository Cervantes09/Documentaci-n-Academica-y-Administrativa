import React, { useState } from 'react';
import { HiOutlineCheck, HiOutlineX, HiOutlineBell, HiOutlineClipboardCheck, HiOutlinePencilAlt, HiOutlineFolderAdd, HiOutlineTrash } from "react-icons/hi";

// Mapeamos los tabs a índices para saber si vamos a la izquierda o derecha
const TAB_INDEX = { documentos: 0, avisos: 1, formatos: 2 };

const AdminDocs = () => {
  const [tabActiva, setTabActiva] = useState('documentos');
  const [direccion, setDireccion] = useState('derecha'); // 'derecha' o 'izquierda'

  const cambiarTab = (nuevoTab) => {
    if (nuevoTab === tabActiva) return;

    // Calculamos si el nuevo tab está a la derecha o izquierda del actual
    const esDerecha = TAB_INDEX[nuevoTab] > TAB_INDEX[tabActiva];
    setDireccion(esDerecha ? 'derecha' : 'izquierda');
    setTabActiva(nuevoTab);
  };

  // Estados para el formulario de avisos
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [tipoAviso, setTipoAviso] = useState('Normal');
  const [fechaProgramada, setFechaProgramada] = useState('');

  // Estados para el formulario de Formatos Oficiales
  const [nombreFormato, setNombreFormato] = useState('');
  const [descripcionFormato, setDescripcionFormato] = useState('');

  // Simulación de documentos que los docentes subieron
  const [documentos, setDocumentos] = useState([
    { id: 1, docente: "Gael Zamora", archivo: "Planeacion_Argumentada.pdf", estado: "Pendiente" },
    { id: 2, docente: "Roberto Ruiz", archivo: "Lista_Asistencia_IDGS81.xlsx", estado: "Pendiente" },
  ]);

  // Simulación de Formatos Oficiales ya publicados
  const [formatosOficiales, setFormatosOficiales] = useState([
    { id: 1, nombre: "Formato_Asesorias_V1.pdf", descripcion: "Control de asesorías académicas", fecha: "2026-02-15" },
    { id: 2, nombre: "Carta_Liberacion_Estadia.docx", descripcion: "Liberación de prácticas profesionales", fecha: "2026-03-01" },
  ]);

  const cambiarEstado = (id, nuevoEstado) => {
    setDocumentos(documentos.map(doc => doc.id === id ? { ...doc, estado: nuevoEstado } : doc));
  };

  const eliminarFormato = (id) => {
    setFormatosOficiales(formatosOficiales.filter(formato => formato.id !== id));
  };

  const subirFormato = (e) => {
    e.preventDefault();
    if (!nombreFormato) return;

    const nuevoFormato = {
      id: formatosOficiales.length + 1,
      nombre: nombreFormato,
      descripcion: descripcionFormato || "Sin descripción",
      fecha: new Date().toISOString().split('T')[0]
    };

    setFormatosOficiales([...formatosOficiales, nuevoFormato]);
    setNombreFormato('');
    setDescripcionFormato('');
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Panel Administrativo</h1>
        <p className="text-slate-500 text-sm">Gestiona el flujo de documentos, comunicación y archivos oficiales de la Academia.</p>
      </header>

      {/* 🚀 MENU DE PESTAÑAS SUPERIOR */}
      <div className="flex border-b border-slate-200 w-full overflow-hidden bg-white rounded-t-xl">
        <button
          onClick={() => cambiarTab('documentos')}
          className={`flex items-center justify-center gap-2 py-4 px-2 font-bold text-sm transition-all duration-300 relative flex-1 ${
            tabActiva === 'documentos' ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
          title="Validación de Documentos"
        >
          <HiOutlineClipboardCheck size={24} className="flex-shrink-0" />
          <span className="hidden md:inline truncate">Validación de Documentos</span>
          {tabActiva === 'documentos' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />
          )}
        </button>

        <button
          onClick={() => cambiarTab('avisos')}
          className={`flex items-center justify-center gap-2 py-4 px-2 font-bold text-sm transition-all duration-300 relative flex-1 ${
            tabActiva === 'avisos' ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
          title="Muro de Academia"
        >
          <HiOutlineBell size={24} className="flex-shrink-0" />
          <span className="hidden md:inline truncate">Muro de Academia</span>
          {tabActiva === 'avisos' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />
          )}
        </button>

        <button
          onClick={() => cambiarTab('formatos')}
          className={`flex items-center justify-center gap-2 py-4 px-2 font-bold text-sm transition-all duration-300 relative flex-1 ${
            tabActiva === 'formatos' ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
          title="Formatos Oficiales"
        >
          <HiOutlineFolderAdd size={24} className="flex-shrink-0" />
          <span className="hidden md:inline truncate">Formatos Oficiales</span>
          {tabActiva === 'formatos' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />
          )}
        </button>
      </div>

      {/* 📦 CONTENEDOR DE CONTENIDO (Se quitó absolute amontonado para evitar que se trabe) */}
      <div className="relative min-h-[500px] overflow-hidden">
        
        {/* === VISTA 1: VALIDACIÓN DE DOCUMENTOS === */}
        {tabActiva === 'documentos' && (
          <div className={`animate-slide-${direccion === 'derecha' ? 'in-right' : 'in-left'} w-full`}>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-700">Documentos por Validar</h2>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[650px] md:min-w-full">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-3">Docente</th>
                      <th className="px-6 py-3">Archivo</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documentos.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">{doc.docente}</td>
                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{doc.archivo}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                            doc.estado === 'Validado' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {doc.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex justify-center gap-2 whitespace-nowrap">
                          <button onClick={() => cambiarEstado(doc.id, 'Validado')} className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"><HiOutlineCheck size={18} /></button>
                          <button onClick={() => cambiarEstado(doc.id, 'Rechazado')} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"><HiOutlineX size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === VISTA 2: CREAR AVISOS DE ACADEMIA === */}
        {tabActiva === 'avisos' && (
          <div className={`animate-slide-${direccion === 'derecha' ? 'in-right' : 'in-left'} w-full`}>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 text-emerald-600 font-bold border-b pb-3">
                <HiOutlinePencilAlt size={24} />
                <h2>Redactar Nuevo Comunicado</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Título del Aviso</label>
                  <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Próxima Reunión" className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Prioridad / Tipo</label>
                  <select value={tipoAviso} onChange={(e) => setTipoAviso(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white">
                    <option value="Normal">Normal (Aviso)</option>
                    <option value="Urgente">🚨 Urgente</option>
                    <option value="Evento">📅 Evento Académico</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Mensaje para los Docentes</label>
                <textarea value={contenido} onChange={(e) => setContenido(e.target.value)} placeholder="Escribe el cuerpo del aviso..." className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" rows="4" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Programar para la fecha</label>
                  <input type="date" value={fechaProgramada} onChange={(e) => setFechaProgramada(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-[45px] rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                  <HiOutlineBell size={18} /> Publicar en Academia
                </button>
              </div>
            </div>
          </div>
        )}

        {/* === VISTA 3: FORMATOS OFICIALES === */}
        {tabActiva === 'formatos' && (
          <div className={`animate-slide-${direccion === 'derecha' ? 'in-right' : 'in-left'} w-full`}>
            <div className="space-y-6">
              <form onSubmit={subirFormato} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold border-b pb-3">
                  <HiOutlineFolderAdd size={24} />
                  <h2>Subir Nuevo Formato Oficial UT</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Nombre del Archivo</label>
                    <input type="text" value={nombreFormato} onChange={(e) => setNombreFormato(e.target.value)} placeholder="Ej: F-AC-01_Asesorias.pdf" className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">Breve Descripción</label>
                    <input type="text" value={descripcionFormato} onChange={(e) => setDescripcionFormato(e.target.value)} placeholder="Ej: Formato para control de tutorías" className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-all flex items-center gap-2">
                    <HiOutlineFolderAdd size={20} /> Cargar Formato
                  </button>
                </div>
              </form>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-700">Formatos Oficiales Publicados</h2>
                </div>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left min-w-[650px] md:min-w-full">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-3">Nombre del Formato</th>
                        <th className="px-6 py-3">Descripción</th>
                        <th className="px-6 py-3">Fecha Publicación</th>
                        <th className="px-6 py-3 text-center">Eliminar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formatosOficiales.map((formato) => (
                        <tr key={formato.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">{formato.nombre}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{formato.descripcion}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{formato.fecha}</td>
                          <td className="px-6 py-4 flex justify-center whitespace-nowrap">
                            <button onClick={() => eliminarFormato(formato.id)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"><HiOutlineTrash size={18} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDocs;