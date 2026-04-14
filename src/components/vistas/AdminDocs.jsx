import React, { useState, useEffect } from 'react';
import { 
  HiOutlineCheck, 
  HiOutlineX, 
  HiOutlineBell, 
  HiOutlineClipboardCheck, 
  HiOutlinePencilAlt, 
  HiOutlineFolderAdd, 
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineDownload 
} from "react-icons/hi";
import { supabase } from '../../lib/supabase';
// IMPORTANTE: Verifica que esta ruta apunte correctamente a tu archivo logger.js
import { registrarLog } from '../../lib/logger.js'; 
import VistaArchivo from './VistaArchivo.jsx';
import { useTranslation } from 'react-i18next'; // 🔥 Importamos el traductor
import Swal from 'sweetalert2'; // 🔥 Importamos SweetAlert2

const TAB_INDEX = { documentos: 0, avisos: 1, formatos: 2 };

const AdminDocs = () => {
  const { t } = useTranslation(); // 🔥 Inicializamos el traductor

  const [tabActiva, setTabActiva] = useState('documentos');
  const [direccion, setDireccion] = useState('derecha');

  const cambiarTab = (nuevoTab) => {
    if (nuevoTab === tabActiva) return;
    const esDerecha = TAB_INDEX[nuevoTab] > TAB_INDEX[tabActiva];
    setDireccion(esDerecha ? 'derecha' : 'izquierda');
    setTabActiva(nuevoTab);
  };

  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [tipoAviso, setTipoAviso] = useState('Normal');
  const [fechaProgramada, setFechaProgramada] = useState('');
  const [publicandoAviso, setPublicandoAviso] = useState(false);

  const [archivoParaVer, setArchivoParaVer] = useState(null);

  const publicarAviso = async () => {
    if (!titulo.trim() || !contenido.trim() || !fechaProgramada) {
      Swal.fire({
        icon: 'warning',
        text: t('adminDocs.alert_campos_vacios'),
        confirmButtonColor: '#059669'
      });
      return;
    }

    try {
      setPublicandoAviso(true);
      const { error } = await supabase
        .from('AVISO')
        .insert([{
            titulo: titulo,
            tipo: tipoAviso,
            contenido: contenido,
            fecha_programada: fechaProgramada
        }]);

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: '¡Excelente!',
        text: t('adminDocs.alert_aviso_exito'),
        confirmButtonColor: '#059669'
      });
      setTitulo('');
      setContenido('');
      setTipoAviso('Normal');
      setFechaProgramada('');
    } catch (error) {
      console.error("Error al publicar aviso:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: t('adminDocs.alert_aviso_error') + " " + error.message,
        confirmButtonColor: '#059669'
      });
    } finally {
      setPublicandoAviso(false);
    }
  };

  const [nombreFormato, setNombreFormato] = useState('');
  const [descripcionFormato, setDescripcionFormato] = useState('');
  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [subiendoFormato, setSubiendoFormato] = useState(false);

  const [documentos, setDocumentos] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  const [formatosOficiales, setFormatosOficiales] = useState([]);
  const [loadingFormatos, setLoadingFormatos] = useState(true);

  const fetchDocumentos = async () => {
    try {
      setLoadingDocs(true);

      const { data, error } = await supabase
        .from('DOCUMENTO')
        .select('*')
        .neq('tipo', 'Formato Oficial') 
        .order('fecha', { ascending: false });

      if (error) throw error;

      const docsPendientes = (data || []).filter(
        doc => doc.estado === 'Pendiente' || !doc.estado
      );

      setDocumentos(docsPendientes);
    } catch (error) {
      console.error("Error al cargar documentos:", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const fetchFormatos = async () => {
    try {
      setLoadingFormatos(true);
      const { data, error } = await supabase
        .from('DOCUMENTO') 
        .select('*')
        .eq('tipo', 'Formato Oficial') 
        .order('fecha', { ascending: false });

      if (error) throw error;
      setFormatosOficiales(data || []);
    } catch (error) {
      console.error("Error al cargar formatos:", error);
    } finally {
      setLoadingFormatos(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const cargar = async () => {
      if (mounted) {
        await fetchDocumentos();
        await fetchFormatos();
      }
    };
    cargar();
    return () => { mounted = false; };
  }, []);

  // FUNCIÓN ACTUALIZADA: Implementación de LOGS para ACCEPT/DECLINE
  const cambiarEstado = async (id, nuevoEstado) => {
    // 1. Ubicamos el documento ANTES de quitarlo del estado para tener sus datos
    const docAfectado = documentos.find(doc => doc.id === id);

    // Actualización optimista de UI
    setDocumentos(documentos.filter(doc => doc.id !== id));

    const { error } = await supabase
      .from('DOCUMENTO')
      .update({ estado: nuevoEstado })
      .eq('id', id);

    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: t('adminDocs.alert_estado_error') + " " + error.message,
        confirmButtonColor: '#059669'
      });
      fetchDocumentos(); 
      return; // Si falla, nos salimos para no registrar un log falso
    }

    // ====== INICIO LOGICA DE LOG (ACCEPT / DECLINE) ======
    if (docAfectado) {
      try {
        // Obtenemos la sesión actual (el Admin/Director que está ejecutando la acción)
        const { data: { user } } = await supabase.auth.getUser();
        
        let adminId = user?.id;
        let adminName = t('adminDocs.administrador_default');

        if (user) {
          // Buscamos el nombre del Admin en la tabla usuario
          const { data: adminData } = await supabase
            .from('usuario')
            .select('usuarioid, nombre')
            .eq('uid_fk', user.id)
            .single();
            
          if (adminData) {
            adminId = adminData.usuarioid;
            adminName = adminData.nombre;
          }
        }

        // Obtenemos al dueño original del documento
        let dueno = null;
        if (docAfectado.usuarioFK) {
          const { data: ownerData } = await supabase
            .from('usuario')
            .select('nombre')
            .eq('usuarioid', docAfectado.usuarioFK)
            .single();
            
          if (ownerData) {
            dueno = { id: docAfectado.usuarioFK, nombre: ownerData.nombre };
          }
        }

        // Traducimos el estado al tipo de operación para el LOG
        const operacion = nuevoEstado === 'Validado' ? 'ACCEPT' : 'DECLINE';

        // Registramos en el log
        await registrarLog(
          adminId, 
          adminName, 
          docAfectado.id, 
          docAfectado.nombre || t('adminDocs.doc_sin_nombre'), 
          operacion, 
          dueno
        );

      } catch (logErr) {
        console.error("Error al registrar log de estado:", logErr);
      }
    }
    // ====== FIN LOGICA DE LOG ======
  };

  const eliminarFormato = async (id) => {
    const formatosAnteriores = [...formatosOficiales];
    setFormatosOficiales(formatosOficiales.filter(formato => formato.id !== id));

    try {
      const { error } = await supabase
        .from('DOCUMENTO') 
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error("Error al eliminar formato:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: t('adminDocs.alert_eliminar_error') + " " + error.message,
        confirmButtonColor: '#059669'
      });
      setFormatosOficiales(formatosAnteriores);
    }
  };

  const subirFormato = async (e) => {
    e.preventDefault();
    if (!nombreFormato || !archivoAdjunto) {
      Swal.fire({
        icon: 'warning',
        text: t('adminDocs.alert_formato_campos'),
        confirmButtonColor: '#059669'
      });
      return;
    }

    try {
      setSubiendoFormato(true);

      const fileExt = archivoAdjunto.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('formatos')
        .upload(fileName, archivoAdjunto);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('formatos')
        .getPublicUrl(fileName);

      const archivoUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from('DOCUMENTO')
        .insert([{
          nombre: nombreFormato,
          clasificacion: descripcionFormato || t('adminDocs.sin_descripcion'), 
          archivo: archivoUrl, 
          tipo: 'Formato Oficial',
          estado: 'Aprobado',
          fecha: new Date().toISOString() 
        }]);

      if (dbError) throw dbError;

      setNombreFormato('');
      setDescripcionFormato('');
      setArchivoAdjunto(null);
      e.target.reset(); 
      fetchFormatos();
      Swal.fire({
        icon: 'success',
        title: '¡Excelente!',
        text: t('adminDocs.alert_formato_exito'),
        confirmButtonColor: '#059669'
      });

    } catch (error) {
      console.error("Error al subir formato:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: t('adminDocs.alert_formato_error') + " " + error.message,
        confirmButtonColor: '#059669'
      });
    } finally {
      setSubiendoFormato(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">{t('adminDocs.titulo')}</h1>
        <p className="text-slate-500 text-sm">{t('adminDocs.subtitulo')}</p>
      </header>

      {/* MENU DE PESTAÑAS SUPERIOR */}
      <div className="flex border-b border-slate-200 w-full overflow-hidden bg-white rounded-t-xl">
        <button
          onClick={() => cambiarTab('documentos')}
          className={`flex items-center justify-center gap-2 py-4 px-2 font-bold text-sm transition-all duration-300 relative flex-1 ${
            tabActiva === 'documentos' ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <HiOutlineClipboardCheck size={24} className="flex-shrink-0" />
          <span className="hidden md:inline truncate">{t('adminDocs.tab_validacion')}</span>
          {tabActiva === 'documentos' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />}
        </button>

        <button
          onClick={() => cambiarTab('avisos')}
          className={`flex items-center justify-center gap-2 py-4 px-2 font-bold text-sm transition-all duration-300 relative flex-1 ${
            tabActiva === 'avisos' ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <HiOutlineBell size={24} className="flex-shrink-0" />
          <span className="hidden md:inline truncate">{t('adminDocs.tab_muro')}</span>
          {tabActiva === 'avisos' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />}
        </button>

        <button
          onClick={() => cambiarTab('formatos')}
          className={`flex items-center justify-center gap-2 py-4 px-2 font-bold text-sm transition-all duration-300 relative flex-1 ${
            tabActiva === 'formatos' ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <HiOutlineFolderAdd size={24} className="flex-shrink-0" />
          <span className="hidden md:inline truncate">{t('adminDocs.tab_formatos')}</span>
          {tabActiva === 'formatos' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />}
        </button>
      </div>

      {/* CONTENEDOR DE CONTENIDO */}
      <div className="relative min-h-[500px] overflow-hidden">
        
        {/* === VISTA 1: VALIDACIÓN DE DOCUMENTOS === */}
        {tabActiva === 'documentos' && (
          <div className={`animate-slide-${direccion === 'derecha' ? 'in-right' : 'in-left'} w-full`}>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                <h2 className="font-bold text-slate-700">{t('adminDocs.docs_pendientes_titulo')}</h2>
                <button onClick={fetchDocumentos} className="text-xs text-emerald-600 font-bold hover:underline">
                  {t('adminDocs.recargar_lista')}
                </button>
              </div>
              
              <div className="overflow-x-auto w-full">
                {loadingDocs ? (
                  <div className="flex justify-center items-center py-10">
                    <p className="text-slate-500 animate-pulse font-medium">{t('adminDocs.cargando_docs')}</p>
                  </div>
                ) : documentos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <HiOutlineCheck size={48} className="mb-2 text-emerald-200" />
                    <p className="text-center font-medium">{t('adminDocs.sin_docs_pendientes')}</p>
                  </div>
                ) : (
                  <table className="w-full text-left min-w-[650px] md:min-w-full">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-6 py-3">{t('adminDocs.col_info_archivo')}</th>
                        <th className="px-6 py-3">{t('adminDocs.col_tipo_clasificacion')}</th>
                        <th className="px-6 py-3 text-center">{t('adminDocs.col_acciones')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {documentos.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-700 truncate max-w-[200px]" title={doc.nombre}>
                              {doc.nombre || t('adminDocs.doc_sin_nombre')}
                            </p>
                            <p className="text-xs text-slate-400">{doc.fecha ? new Date(doc.fecha).toLocaleDateString() : t('adminDocs.sin_fecha')}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-slate-600">{doc.tipo}</p>
                            <p className="text-xs text-emerald-600 font-medium">{doc.clasificacion}</p>
                          </td>
                          <td className="px-6 py-4 flex justify-center gap-2 whitespace-nowrap">
                            <button 
                              onClick={() => setArchivoParaVer(doc)} 
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                              title={t('adminDocs.btn_ver_doc')}
                            >
                              <HiOutlineEye size={18} />
                            </button>
                            <button 
                              onClick={() => cambiarEstado(doc.id, 'Validado')} 
                              className="p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                              title={t('adminDocs.btn_aceptar')}
                            >
                              <HiOutlineCheck size={18} />
                            </button>
                            <button 
                              onClick={() => cambiarEstado(doc.id, 'Rechazado')} 
                              className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                              title={t('adminDocs.btn_rechazar')}
                            >
                              <HiOutlineX size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
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
                <h2>{t('adminDocs.redactar_titulo')}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">{t('adminDocs.label_titulo_aviso')}</label>
                  <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={t('adminDocs.placeholder_titulo_aviso')} className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">{t('adminDocs.label_prioridad')}</label>
                  <select value={tipoAviso} onChange={(e) => setTipoAviso(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white">
                    <option value="Normal">{t('adminDocs.opt_normal')}</option>
                    <option value="Urgente">{t('adminDocs.opt_urgente')}</option>
                    <option value="Evento">{t('adminDocs.opt_evento')}</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">{t('adminDocs.label_mensaje')}</label>
                <textarea value={contenido} onChange={(e) => setContenido(e.target.value)} placeholder={t('adminDocs.placeholder_mensaje')} className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" rows="4" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">{t('adminDocs.label_fecha')}</label>
                  <input type="date" value={fechaProgramada} onChange={(e) => setFechaProgramada(e.target.value)} className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                </div>
                
                <button 
                  onClick={publicarAviso}
                  disabled={publicandoAviso}
                  className={`bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-[45px] rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${publicandoAviso ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  <HiOutlineBell size={18} /> 
                  {publicandoAviso ? t('adminDocs.btn_publicando') : t('adminDocs.btn_publicar')}
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
                  <h2>{t('adminDocs.subir_formato_titulo')}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">{t('adminDocs.label_nombre_archivo')}</label>
                    <input type="text" value={nombreFormato} onChange={(e) => setNombreFormato(e.target.value)} placeholder={t('adminDocs.placeholder_nombre_archivo')} className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 uppercase">{t('adminDocs.label_descripcion')}</label>
                    <input type="text" value={descripcionFormato} onChange={(e) => setDescripcionFormato(e.target.value)} placeholder={t('adminDocs.placeholder_descripcion')} className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
                  </div>
                  {/* SECCIÓN DEL ARCHIVO */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-slate-600 uppercase">{t('adminDocs.label_adjuntar')}</label>
                    <input 
                      type="file" 
                      onChange={(e) => setArchivoAdjunto(e.target.files[0])} 
                      className="w-full p-2 text-sm border border-slate-200 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" 
                      required 
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button 
                    type="submit" 
                    disabled={subiendoFormato}
                    className={`bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-lg text-sm transition-all flex items-center gap-2 ${subiendoFormato ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    <HiOutlineFolderAdd size={20} /> 
                    {subiendoFormato ? t('adminDocs.btn_subiendo') : t('adminDocs.btn_cargar_formato')}
                  </button>
                </div>
              </form>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="font-bold text-slate-700">{t('adminDocs.formatos_publicados_titulo')}</h2>
                </div>
                
                <div className="overflow-x-auto w-full">
                  {loadingFormatos ? (
                    <div className="flex justify-center items-center py-10">
                      <p className="text-slate-500 animate-pulse font-medium">{t('adminDocs.cargando_formatos')}</p>
                    </div>
                  ) : formatosOficiales.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                      <p className="text-center font-medium">{t('adminDocs.sin_formatos')}</p>
                    </div>
                  ) : (
                    <table className="w-full text-left min-w-[650px] md:min-w-full">
                      <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                        <tr>
                          <th className="px-6 py-3">{t('adminDocs.col_nombre_formato')}</th>
                          <th className="px-6 py-3">{t('adminDocs.col_descripcion')}</th>
                          <th className="px-6 py-3">{t('adminDocs.col_fecha_pub')}</th>
                          <th className="px-6 py-3 text-center">{t('adminDocs.col_acciones')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formatosOficiales.map((formato) => (
                          <tr key={formato.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm font-medium text-slate-700 whitespace-nowrap">{formato.nombre}</td>
                            <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">{formato.clasificacion}</td>
                            <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                              {formato.fecha ? new Date(formato.fecha).toLocaleDateString() : t('adminDocs.sin_fecha')}
                            </td>
                            <td className="px-6 py-4 flex justify-center gap-2 whitespace-nowrap">
                              {/* Botón de ver/descargar el archivo adjunto */}
                              {formato.archivo && (
                                <a 
                                  href={formato.archivo} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                  title={t('adminDocs.btn_descargar_formato')}
                                >
                                  <HiOutlineDownload size={18} />
                                </a>
                              )}
                              <button 
                                onClick={() => eliminarFormato(formato.id)} 
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                title={t('adminDocs.btn_eliminar')}
                              >
                                <HiOutlineTrash size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      <VistaArchivo 
        archivo={archivoParaVer} 
        onClose={() => setArchivoParaVer(null)} 
      />

    </div>
  );
};

export default AdminDocs;