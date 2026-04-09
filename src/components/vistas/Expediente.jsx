import React, { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlinePlus, HiOutlineDocumentText, HiOutlineDotsVertical, HiOutlineFilter, HiOutlineX } from "react-icons/hi";
import SubirArchivo from './SubirArchivo.jsx';
import VistaArchivo from './VistaArchivo.jsx';
import { supabase } from '../../lib/supabase';
import AvisoDocumento from './AvisoDocumento.jsx';

const MiExpediente = () => {
  const [busqueda, setBusqueda] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para controlar la edición
  const [docAEditar, setDocAEditar] = useState(null); 
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);
  
  // Estado para controlar qué menú de opciones (3 puntitos) está abierto
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  // Estados para el visor y descargas
  const [archivoParaVer, setArchivoParaVer] = useState(null);
  const [descargandoId, setDescargandoId] = useState(null);

  // Estados para el Aviso Documento (Aceptado/Rechazado)
  const [isAvisoOpen, setIsAvisoOpen] = useState(false);
  const [avisoDocName, setAvisoDocName] = useState("");
  const [avisoStatus, setAvisoStatus] = useState("");

  // ====== ESTADOS PARA LOS FILTROS DE ROLES ======
  const [userId, setUserId] = useState(null); // Guardar el ID de quien navega
  const [userRole, setUserRole] = useState("");
  const [docentes, setDocentes] = useState([]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  // Estados de los nuevos filtros ("checkboxes" estilo botones)
  const [modoVista, setModoVista] = useState('propios'); // 'propios' o 'docentes'
  const [filtroDocente, setFiltroDocente] = useState(""); // "" = Todos, ID = Uno específico

  // Función para abrir el aviso adaptando tus estatus
  const abrirAviso = (nombreDocumento, estatusBD) => {
    setAvisoDocName(nombreDocumento);
    setAvisoStatus(estatusBD === 'Validado' ? 'accepted' : 'rejected');
    setIsAvisoOpen(true);
  };

  useEffect(() => {
    let activo = true;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: perfil } = await supabase
            .from('usuario')
            .select('usuarioid, tipousuario')
            .eq('uid_fk', user.id)
            .single();

          if (perfil) {
            setUserId(perfil.usuarioid);
            setUserRole(perfil.tipousuario);

            // Si es administrativo o director, traer lista de correos de docentes
            if (perfil.tipousuario === 'administrativo' || perfil.tipousuario === 'director') {
              const { data: listaDocentes } = await supabase
                .from('usuario')
                .select('usuarioid, email')
                .eq('tipousuario', 'docente');
              
              if (listaDocentes) {
                setDocentes(listaDocentes);
              }
            }

            // Traemos SOLO los documentos con estado "Validado" excluyendo los Formatos Oficiales
            let query = supabase
              .from('DOCUMENTO')
              .select('*')
              .eq('estado', 'Validado')
              .neq('tipo', 'Formato Oficial') 
              .order('fecha', { ascending: false });

            // Si es docente, bloqueamos para que SOLO pida los suyos a la base de datos
            if (perfil.tipousuario === 'docente') {
              query = query.eq('usuarioFK', perfil.usuarioid);
            }

            const { data, error } = await query;

            if (!activo) return;
            if (error) console.error("Error al obtener expediente:", error);
            else setArchivos(data || []);
          }
        }
      } catch (err) {
        console.error("Error general:", err);
      }
      setLoading(false);
    };

    fetchData();
    return () => { activo = false; };
  }, []);

  const recargar = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabase
          .from('usuario')
          .select('usuarioid, tipousuario')
          .eq('uid_fk', user.id)
          .single();

        if (perfil) {
          setUserId(perfil.usuarioid);
          
          let query = supabase
            .from('DOCUMENTO')
            .select('*')
            .eq('estado', 'Validado')
            .neq('tipo', 'Formato Oficial') // Exclusión del Formato Oficial en la recarga
            .order('fecha', { ascending: false });

          if (perfil.tipousuario === 'docente') {
            query = query.eq('usuarioFK', perfil.usuarioid);
          }

          const { data, error } = await query;
          if (!error) setArchivos(data || []);
        }
      }
    } catch (err) {
      console.error("Error al recargar:", err);
    }
    setLoading(false);
  };

  // Lógica pesada de los filtros: Nombre + Tus propios botones
  const archivosFiltrados = archivos.filter(archivo => {
    // 1. Filtro por caja de texto
    const termino = busqueda.toLowerCase();
    const nombreDoc = archivo.nombre?.toLowerCase() || "";
    const urlDoc = archivo.archivo?.toLowerCase() || "";
    const coincideTexto = nombreDoc.includes(termino) || urlDoc.includes(termino);
    
    // 2. Filtro por el mecanismo de "Mis Archivos" vs "Docentes"
    let coincideVista = true;
    if (userRole === 'administrativo' || userRole === 'director') {
      if (modoVista === 'propios') {
        // Solo ver los míos
        coincideVista = archivo.usuarioFK === userId;
      } else if (modoVista === 'docentes') {
        if (filtroDocente === "") {
          // Todos los docentes (verificamos que el dueño del documento esté en la lista de profes)
          coincideVista = docentes.some(d => d.usuarioid === archivo.usuarioFK);
        } else {
          // Un profe en específico
          coincideVista = archivo.usuarioFK === filtroDocente;
        }
      }
    }

    return coincideTexto && coincideVista;
  });

  const guardarEdicion = async (e) => {
    e.preventDefault();
    setGuardandoEdicion(true);

    const { error } = await supabase
      .from('DOCUMENTO')
      .update({
        nombre: docAEditar.nombre,
        tipo: docAEditar.tipo,
        clasificacion: docAEditar.clasificacion
      })
      .eq('id', docAEditar.id);

    if (error) {
      alert("Error al actualizar: " + error.message);
    } else {
      setDocAEditar(null);
      recargar();
    }
    setGuardandoEdicion(false);
  };

  const eliminarArchivo = async (id) => {
    const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este documento?");
    if (!confirmacion) return;

    const { error } = await supabase.from('DOCUMENTO').delete().eq('id', id);

    if (error) {
      alert("Error al eliminar: " + error.message);
    } else {
      recargar();
    }
    setMenuAbiertoId(null);
  };

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

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Expediente</h1>
          <p className="text-slate-500 text-sm">Gestiona y organiza tus documentos académicos oficiales.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center cursor-pointer justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold transition-all shadow-md active:scale-95"
        >
          <HiOutlinePlus size={20} />
          <span>Subir Archivo</span>
        </button>
      </div>

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

        {/* ====== MENÚ DE FILTROS AVANZADOS (SOLO ADMIN/DIRECTOR) ====== */}
        {(userRole === 'administrativo' || userRole === 'director') && (
          <div className="relative">
            <button 
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`h-full flex items-center justify-center gap-2 px-4 py-2 border rounded-lg transition-all shadow-sm font-medium ${
                modoVista === 'docentes'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <HiOutlineFilter size={20} />
              <span className="hidden sm:inline">
                {modoVista === 'propios' ? "Mis Archivos" : (filtroDocente === "" ? "Docs. Docentes" : "Filtrado")}
              </span>
            </button>

            {/* Panel Desplegable de Filtros */}
            {isFilterMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-100 shadow-xl rounded-xl py-2 z-30 overflow-hidden">
                
                {/* Los "Checkboxes" convertidos a botones toggle */}
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">Mostrar:</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setModoVista('propios')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${modoVista === 'propios' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      Mis Archivos
                    </button>
                    <button 
                      onClick={() => { setModoVista('docentes'); setFiltroDocente(""); }}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${modoVista === 'docentes' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      De Docentes
                    </button>
                  </div>
                </div>

                {/* Lista que solo se muestra si está en "De Docentes" */}
                {modoVista === 'docentes' && (
                  <>
                    <div className="px-3 py-2 border-b border-slate-100 bg-slate-50 mb-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Seleccionar Docente Específico</p>
                    </div>
                    
                    <div className="max-h-56 overflow-y-auto">
                      <button 
                        onClick={() => { setFiltroDocente(""); setIsFilterMenuOpen(false); }}
                        className={`w-full text-left cursor-pointer px-4 py-2 text-sm transition-colors ${filtroDocente === "" ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        ✅ Todos los Docentes
                      </button>
                      {docentes.map(docente => (
                        <button 
                          key={docente.usuarioid}
                          onClick={() => { setFiltroDocente(docente.usuarioid); setIsFilterMenuOpen(false); }}
                          className={`w-full text-left cursor-pointer px-4 py-2 text-sm transition-colors truncate ${filtroDocente === docente.usuarioid ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                          title={docente.email}
                        >
                          {docente.email}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {loading && <p className="text-emerald-600 font-bold animate-pulse text-center py-10">Cargando tu expediente...</p>}
      {!loading && archivosFiltrados.length === 0 && (
        <div className="text-center py-10 text-slate-400 flex flex-col items-center">
          <p>No se encontraron documentos.</p>
          {modoVista === 'docentes' && <span className="text-xs mt-1 text-slate-300">(Prueba seleccionando "Mis Archivos" u otro docente)</span>}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {archivosFiltrados.map((archivo) => (
          <div key={archivo.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-4 relative">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                <HiOutlineDocumentText size={30} />
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setMenuAbiertoId(menuAbiertoId === archivo.id ? null : archivo.id)}
                  className="text-slate-400 hover:text-emerald-600 hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
                  title="Opciones"
                >
                  <HiOutlineDotsVertical size={20} />
                </button>

                {menuAbiertoId === archivo.id && (
                  <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-100 shadow-xl rounded-lg py-1 z-20 overflow-hidden">
                    <button 
                      onClick={() => { setDocAEditar(archivo); setMenuAbiertoId(null); }}
                      className="w-full text-left cursor-pointer px-4 py-2 text-xs font-bold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => eliminarArchivo(archivo.id)}
                      className="w-full text-left cursor-pointer px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <h3 className="font-bold text-slate-700 text-sm truncate mb-1" title={archivo.nombre || archivo.archivo}>
              {archivo.nombre || archivo.archivo?.split('/').pop() || "Documento"} 
            </h3>
            
            <p className="text-[10px] text-emerald-600 font-bold uppercase mb-3">
              {archivo.tipo} <span className="text-slate-300 mx-1">•</span> {archivo.clasificacion}
            </p>
            
            <div className="flex justify-between items-center text-[11px] font-medium border-t pt-3">
              <span className="text-slate-400">{new Date(archivo.fecha).toLocaleDateString()}</span>
              <span 
                onClick={() => {
                  if(archivo.estado === 'Validado' || archivo.estado === 'Rechazado') {
                    abrirAviso(archivo.nombre || archivo.archivo?.split('/').pop() || "Documento", archivo.estado);
                  }
                }}
                className={`px-2 py-0.5 rounded-full ${
                  archivo.estado === 'Validado' || archivo.estado === 'Rechazado' ? 'cursor-pointer hover:opacity-80 shadow-sm' : ''
                } ${
                  archivo.estado === 'Validado' ? 'bg-emerald-100 text-emerald-700' : 
                  archivo.estado === 'Rechazado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {archivo.estado}
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 bg-white/95 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl border-t">
              <button 
                onClick={() => setArchivoParaVer(archivo)}
                className="flex-1 text-[11px] font-bold py-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-center"
              >
                Ver
              </button>
              <button 
                onClick={() => forzarDescarga(archivo.archivo, archivo.nombre, archivo.id)}
                disabled={descargandoId === archivo.id}
                className="flex-1 text-[11px] font-bold py-1.5 border border-slate-200 text-slate-600 rounded hover:bg-slate-50 text-center disabled:opacity-50"
              >
                {descargandoId === archivo.id ? 'Descargando...' : 'Descargar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <SubirArchivo 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUploadSuccess={recargar} 
        userRole={userRole}
      />
      
      {/* Modal Edición (Oculto) */}
      {docAEditar && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative border border-slate-100">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="font-bold text-slate-800">Editar Documento</h2>
              <button onClick={() => setDocAEditar(null)} className="text-slate-400 hover:text-red-500"><HiOutlineX size={20}/></button>
            </div>
            <form onSubmit={guardarEdicion} className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Nombre:</label>
                <input type="text" value={docAEditar.nombre || ""} onChange={(e) => setDocAEditar({...docAEditar, nombre: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm focus:ring-1 focus:ring-emerald-500 outline-none" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Tipo:</label>
                <select value={docAEditar.tipo || ""} onChange={(e) => setDocAEditar({...docAEditar, tipo: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm outline-none">
                  {["Planeación Docente", "Lista de Asistencia", "Acta de Academia", "Reporte Final"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600">Periodo:</label>
                <select value={docAEditar.clasificacion || ""} onChange={(e) => setDocAEditar({...docAEditar, clasificacion: e.target.value})} className="w-full p-2 border border-slate-200 rounded text-sm outline-none">
                  {["ENE-ABR 2026", "MAY-AGO 2026", "SEP-DIC 2026"].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="pt-3">
                <button type="submit" disabled={guardandoEdicion} className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg text-sm hover:bg-emerald-700 disabled:opacity-50">
                  {guardandoEdicion ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <VistaArchivo archivo={archivoParaVer} onClose={() => setArchivoParaVer(null)} />
      <AvisoDocumento isOpen={isAvisoOpen} onClose={() => setIsAvisoOpen(false)} documentName={avisoDocName} status={avisoStatus} />
    </div>
  );
};

export default MiExpediente;