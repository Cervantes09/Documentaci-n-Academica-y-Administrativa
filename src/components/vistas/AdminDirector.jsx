import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  HiOutlineUserAdd, 
  HiOutlineTrash, 
  HiOutlineCheck, 
  HiOutlineDocumentReport, 
  HiOutlineDatabase,
  HiOutlineChartBar // 🔥 NUEVO: Icono para la gráfica
} from "react-icons/hi";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useTranslation } from 'react-i18next'; // 🔥 1. Importamos el traductor
// 🔥 NUEVO: Importamos los componentes de Recharts para la gráfica
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TAB_INDEX = { usuarios: 0, reportes: 1 };

const AdminDirector = () => {
  const { t } = useTranslation(); // 🔥 2. Inicializamos el traductor

  const [tabActiva, setTabActiva] = useState('usuarios');
  const [direccion, setDireccion] = useState('derecha');
  const [cargando, setCargando] = useState(false);
  
  // Estados de configuración con valores iniciales
  const [horaRespaldo, setHoraRespaldo] = useState("02:00");
  const [frecuencia, setFrecuencia] = useState("Diario");

  // Estado real de usuarios pendientes
  const [usuariosPendientes, setUsuariosPendientes] = useState([]);

  // 🔥 NUEVO: Estado para almacenar los datos de la gráfica
  const [datosGrafica, setDatosGrafica] = useState([]);

  // ==========================================
  // CARGA INICIAL (CONFIGURACIÓN Y USUARIOS)
  // ==========================================
  useEffect(() => {
    const obtenerDatosIniciales = async () => {
      // 1. Obtener configuración
      try {
        const { data, error } = await supabase
          .from('configuracion_sistema')
          .select('hora_respaldo, frecuencia')
          .eq('id', 'config_backup')
          .single();

        if (data) {
          setHoraRespaldo(data.hora_respaldo.substring(0, 5));
          setFrecuencia(data.frecuencia);
        }
      } catch (err) {
        console.error("Error al recuperar configuración inicial:", err);
      }

      // 2. Obtener usuarios pendientes (AHORA DESDE LA VISTA SQL)
      try {
        const { data: usuarios, error: errorUsuarios } = await supabase
          .from('vista_usuarios_pendientes') // <- Usamos la vista que cruza con AUTH
          .select('*');

        if (errorUsuarios) throw errorUsuarios;
        if (usuarios) setUsuariosPendientes(usuarios);
      } catch (err) {
        console.error("Error al recuperar usuarios pendientes:", err);
      }
    };

    obtenerDatosIniciales();
  }, []);

  // 🔥 NUEVO: Efecto para cargar los datos de la gráfica cuando se abre la pestaña de reportes
  useEffect(() => {
    if (tabActiva === 'reportes') {
      const cargarDatosGrafica = async () => {
        try {
          const hoy = new Date();
          const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
          const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59).toISOString();
          
          // 🔥 NUEVO: Se agregó 'asunto' a la consulta de logs para poder clasificarlos
          const { data: docs } = await supabase.from('DOCUMENTO').select('fecha').gte('fecha', inicioMes).lte('fecha', finMes);
          const { data: logs } = await supabase.from('LOGS').select('created_at, asunto').gte('created_at', inicioMes).lte('created_at', finMes);

          // Preparamos un objeto con todos los días del mes en curso (inicializados en 0)
          const diasEnMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
          const agrupado = {};
          
          // 🔥 NUEVO: El ciclo asegura que la gráfica cubra desde el día 1 hasta el último día del mes
          for(let i = 1; i <= diasEnMes; i++) {
            const diaStr = i.toString().padStart(2, '0');
            // 🔥 NUEVO: Separamos las incidencias en modificaciones y eliminaciones
            agrupado[diaStr] = { dia: diaStr, documentos: 0, modificaciones: 0, eliminaciones: 0 };
          }

          // 🔥 NUEVO: Sumamos los documentos por día
          docs?.forEach(d => {
            const dia = new Date(d.fecha).getDate().toString().padStart(2, '0');
            if(agrupado[dia]) agrupado[dia].documentos += 1;
          });

          // 🔥 NUEVO: Sumamos y clasificamos las incidencias (logs) por día según su asunto
          logs?.forEach(l => {
            const dia = new Date(l.created_at).getDate().toString().padStart(2, '0');
            if(agrupado[dia]) {
              const asun = (l.asunto || '').toLowerCase();
              if (asun.includes('elimin') || asun.includes('borr')) {
                agrupado[dia].eliminaciones += 1;
              } else if (asun.includes('modific') || asun.includes('actualiz') || asun.includes('edit')) {
                agrupado[dia].modificaciones += 1;
              }
            }
          });

          // 🔥 NUEVO: Convertimos el objeto en un array y lo ordenamos estrictamente del 01 al último día
          const datosOrdenados = Object.values(agrupado).sort((a, b) => parseInt(a.dia) - parseInt(b.dia));
          setDatosGrafica(datosOrdenados);
        } catch (error) {
          console.error("Error al cargar datos de la gráfica:", error);
        }
      };

      cargarDatosGrafica();
    }
  }, [tabActiva]);

  const cambiarTab = (nuevoTab) => {
    if (nuevoTab === tabActiva) return;
    const esDerecha = TAB_INDEX[nuevoTab] > TAB_INDEX[tabActiva];
    setDireccion(esDerecha ? 'derecha' : 'izquierda');
    setTabActiva(nuevoTab);
  };

  // ==========================================
  // LÓGICA DE APROBACIÓN Y RECHAZO DE USUARIOS
  // ==========================================
  const cambiarRol = async (user, nuevoRol) => {
    try {
      // Nota: El update sigue siendo a la tabla original 'usuario'
      const { error } = await supabase
        .from('usuario')
        .update({ tipousuario: nuevoRol })
        .eq('usuarioid', user.usuarioid); 

      if (error) throw error;
      
      alert(`${t('admin.alert_aprobado')} ${nuevoRol.toUpperCase()}.`);
      // Remover de la vista actual filtrando por usuarioid
      setUsuariosPendientes(prev => prev.filter(u => u.usuarioid !== user.usuarioid));
    } catch (error) {
      alert(`${t('admin.alert_error_rol')} ${error.message}`);
    }
  };

  const eliminarUsuario = async (user) => {
    const confirmar = window.confirm(t('admin.confirm_eliminar'));
    if (!confirmar) return;

    try {
      // 1. Eliminar de la tabla pública usando usuarioid
      const { error: dbError } = await supabase
        .from('usuario')
        .delete()
        .eq('usuarioid', user.usuarioid); 

      if (dbError) throw dbError;

      // 2. Eliminar de la tabla AUTH vía RPC usando la foránea (uid_fk)
      if (user.uid_fk) {
        const { error: authError } = await supabase.rpc('eliminar_usuario_auth', { 
          auth_uid: user.uid_fk 
        });
        
        if (authError) {
          console.warn("Borrado de la tabla usuario, pero fallo en Auth:", authError);
        }
      }

      alert(t('admin.alert_eliminado'));
      // Actualizamos la vista
      setUsuariosPendientes(prev => prev.filter(u => u.usuarioid !== user.usuarioid));
    } catch (error) {
      alert(`${t('admin.alert_error_eliminar')} ${error.message}`);
    }
  };

  // ==========================================
  // LÓGICA DE RESPALDO AUTOMÁTICOS (RPC)
  // ==========================================
  const handleGuardarConfig = async () => {
    setCargando(true);
    try {
      const { error } = await supabase.rpc('actualizar_configuracion_respaldo', {
        nueva_hora: `${horaRespaldo}:00`,
        nueva_frecuencia: frecuencia
      });

      if (error) throw error;
      alert(t('admin.alert_config_guardada'));
    } catch (error) {
      alert(`${t('admin.alert_error')} ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // LÓGICA DE RESPALDOS MANUALES (BACKUP)
  // ==========================================
  const generarBackup = async () => {
    setCargando(true);
    try {
      const tablas = ['DOCUMENTO', 'AVISO', 'configuracion_sistema', 'usuario', 'LOGS']; 
      let backupData = {};

      for (const tabla of tablas) {
        const { data, error } = await supabase.from(tabla).select('*');
        if (error) throw error;
        backupData[tabla] = data;
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `RESPALDO_SISTEMA_${new Date().toLocaleDateString().replace(/\//g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert(t('admin.alert_respaldo_exito'));
    } catch (error) {
      console.error(error);
      alert(t('admin.alert_error_respaldo'));
    } finally {
      setCargando(false);
    }
  };

  const restaurarSistema = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const confirmar = window.confirm(t('admin.confirm_restaurar'));
    if (!confirmar) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const contenido = JSON.parse(e.target.result);
        for (const tabla in contenido) {
          const { error } = await supabase
            .from(tabla)
            .upsert(contenido[tabla]);
          if (error) throw error;
        }
        alert(t('admin.alert_restaurado'));
        window.location.reload(); 
      } catch (error) {
        console.error(error);
        alert(t('admin.alert_error_archivo'));
      }
    };
    reader.readAsText(file);
  };

  const generarReportePDF = async () => {
    try {
      const hoy = new Date();
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data: documentos, error } = await supabase
        .from('DOCUMENTO')
        .select(`
          nombre,
          fecha,
          autor:usuarioFK ( nombre )
        `)
        .gte('fecha', inicioMes)
        .lte('fecha', finMes);

      if (error) throw error;
      if (!documentos || documentos.length === 0) {
        alert(t('admin.alert_no_docs'));
        return;
      }

      const doc = new jsPDF();
      autoTable(doc, {
        startY: 35,
        head: [[t('admin.pdf_col_doc'), t('admin.pdf_col_autor'), t('admin.pdf_col_fecha')]],
        body: documentos.map(d => [
          d.nombre,
          d.autor?.nombre || t('admin.docente_no_asignado'),
          new Date(d.fecha).toLocaleString()
        ]),
        headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 255, 250] },
        styles: { fontSize: 10, cellPadding: 3 },
        didDrawPage: (data) => {
          doc.setFontSize(18);
          doc.setTextColor(5, 150, 105);
          doc.text(`${t('admin.pdf_titulo_docs')} - ${new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(hoy)}`, 14, 20);
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`${t('admin.pdf_generado')} ${new Date().toLocaleString()}`, 14, 28);
        }
      });
      doc.save(`Reporte_Mensual_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert(`${t('admin.alert_error_critico')} ${error.message}`);
    }
  }; 

  // ==========================================
  // NUEVA LÓGICA: REPORTE DE LOGS (INCIDENCIAS)
  // ==========================================
  const generarReporteLogsPDF = async () => {
    try {
      const hoy = new Date();
      // Filtramos por el mes actual
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
      const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59).toISOString();

      // Basado en tus capturas, la tabla se llama 'LOGS'
      const { data: logs, error } = await supabase
        .from('LOGS')
        .select('asunto, created_at')
        .gte('created_at', inicioMes)
        .lte('created_at', finMes);

      if (error) throw error;
      if (!logs || logs.length === 0) {
        alert(t('admin.alert_no_incidencias'));
        return;
      }

      const doc = new jsPDF();
      autoTable(doc, {
        startY: 35,
        // 🔥 NUEVO: Se agregó la columna "Tipo de Incidencia" para diferenciar modificaciones/eliminaciones
        head: [[t('admin.pdf_col_asunto'), 'Tipo de Incidencia', t('admin.pdf_col_fecha_log'), t('admin.pdf_col_hora')]],
        body: logs.map(log => {
          const fechaObj = new Date(log.created_at);
          
          // 🔥 NUEVO: Analizamos el asunto para detectar si es eliminación o modificación de forma dinámica
          const asuntoTexto = (log.asunto || '').toLowerCase();
          let tipoIncidencia = 'Otro / Registro';
          if (asuntoTexto.includes('elimin') || asuntoTexto.includes('borr')) {
            tipoIncidencia = 'Eliminación';
          } else if (asuntoTexto.includes('modific') || asuntoTexto.includes('actualiz') || asuntoTexto.includes('edit')) {
            tipoIncidencia = 'Modificación';
          }

          // Separamos la fecha y la hora para que la gente normal lo entienda xd
          return [
            log.asunto || t('admin.sin_asunto'),
            tipoIncidencia, // 🔥 NUEVO: Se pasa el tipo extraído a la tabla
            fechaObj.toLocaleDateString('es-MX'), // Da un formato como DD/MM/YYYY
            fechaObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute:'2-digit' }) // Da un formato como HH:MM
          ];
        }),
        headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 255, 250] },
        styles: { fontSize: 10, cellPadding: 3 },
        didDrawPage: (data) => {
          doc.setFontSize(18);
          doc.setTextColor(5, 150, 105);
          doc.text(`${t('admin.pdf_titulo_incidencias')} - ${new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(hoy)}`, 14, 20);
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`${t('admin.pdf_generado')} ${new Date().toLocaleString()}`, 14, 28);
        }
      });
      doc.save(`Reporte_Incidencias_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF de logs:", error);
      alert(`${t('admin.alert_error_critico_incidencias')} ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">{t('admin.titulo')}</h1>
        <p className="text-slate-500 text-sm">{t('admin.subtitulo')}</p>
      </header>

      {/* TABS SUPERIORES */}
      <div className="flex border-b border-slate-200 w-full overflow-hidden bg-white rounded-t-xl">
        <button
          onClick={() => cambiarTab('usuarios')}
          className={`flex items-center justify-center gap-2 py-4 px-2 font-bold text-sm transition-all duration-300 relative flex-1 cursor-pointer ${
            tabActiva === 'usuarios' ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <HiOutlineUserAdd size={24} className="flex-shrink-0" />
          <span className="hidden md:inline truncate">{t('admin.tab_usuarios')}</span>
          {tabActiva === 'usuarios' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />}
        </button>

        <button
          onClick={() => cambiarTab('reportes')}
          className={`flex items-center justify-center gap-2 py-4 px-2 font-bold text-sm transition-all duration-300 relative flex-1 cursor-pointer ${
            tabActiva === 'reportes' ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <HiOutlineDocumentReport size={24} className="flex-shrink-0" />
          <span className="hidden md:inline truncate">{t('admin.tab_reportes')}</span>
          {tabActiva === 'reportes' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />}
        </button>
      </div>

      <div className="relative min-h-[500px] overflow-hidden">
        {/* VISTA 1: USUARIOS */}
        {tabActiva === 'usuarios' && (
          <div className={`animate-slide-in-${direccion === 'derecha' ? 'right' : 'left'} w-full space-y-6`}>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-700">{t('admin.usuarios_esperando')}</h2>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[650px] md:min-w-full">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-3">{t('admin.tabla_nombre')}</th>
                      <th className="px-6 py-3">{t('admin.tabla_correo')}</th>
                      <th className="px-6 py-3 text-center">{t('admin.tabla_rol')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usuariosPendientes.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-10 text-center text-slate-400 text-sm">{t('admin.sin_usuarios')}</td>
                      </tr>
                    ) : (
                      usuariosPendientes.map((user) => (
                        <tr key={user.usuarioid} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">{user.nombre}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{user.correo || t('admin.cargando')}</td>
                          <td className="px-6 py-4 flex justify-center gap-2">
                            <button onClick={() => cambiarRol(user, 'docente')} className="flex items-center gap-1 p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-xs font-bold cursor-pointer">
                              <HiOutlineCheck size={16} /> {t('admin.btn_docente')}
                            </button>
                            <button onClick={() => cambiarRol(user, 'administrativo')} className="flex items-center gap-1 p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs font-bold cursor-pointer">
                              <HiOutlineUserAdd size={16} /> {t('admin.btn_administrativo')}
                            </button>
                            <button onClick={() => eliminarUsuario(user)} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors cursor-pointer">
                              <HiOutlineTrash size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: REPORTES Y DB */}
        {tabActiva === 'reportes' && (
          <div className={`animate-slide-in-${direccion === 'derecha' ? 'right' : 'left'} w-full space-y-6 pb-10`}>
            
            {/* 🔥 NUEVO: SECCIÓN DE LA GRÁFICA 🔥 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold border-b pb-3">
                <HiOutlineChartBar size={24} />
                <h2>Actividad del Mes (Documentos vs Incidencias)</h2>
              </div>
              
              <div className="w-full h-72 mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosGrafica} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    
                    {/* 🔥 NUEVO: interval={0} fuerza a pintar todas las etiquetas en orden cronológico exacto */}
                    <XAxis 
                      dataKey="dia" 
                      tick={{fontSize: 10, fill: '#64748B'}} 
                      axisLine={false} 
                      tickLine={false} 
                      interval={0} 
                    />
                    
                    <YAxis tick={{fontSize: 12, fill: '#64748B'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelFormatter={(label) => `Día ${label}`}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="documentos" name="Nuevos Documentos" fill="#059669" radius={[4, 4, 0, 0]} />
                    {/* 🔥 NUEVO: Ahora la gráfica separa visualmente si hubo una modificación o eliminación */}
                    <Bar dataKey="modificaciones" name="Modificaciones" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="eliminaciones" name="Eliminaciones" fill="#EF4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold border-b pb-3">
                  <HiOutlineDocumentReport size={24} />
                  <h2>{t('admin.reportes_titulo')}</h2>
                </div>
                <div className="space-y-2">
                  <button onClick={generarReportePDF} className="w-full bg-slate-800 hover:bg-slate-900 cursor-pointer text-white font-bold py-3 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                    {t('admin.btn_reporte_docs')}
                  </button>
                  {/* AQUÍ SE AGREGÓ LA LLAMADA AL NUEVO REPORTE */}
                  <button onClick={generarReporteLogsPDF} className="w-full bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-800 font-bold py-3 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                    {t('admin.btn_reporte_logs')}
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-amber-600 font-bold border-b pb-3">
                  <HiOutlineDatabase size={24} />
                  <h2>{t('admin.db_titulo')}</h2>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={generarBackup}
                    disabled={cargando}
                    className={`w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${cargando ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
                  >
                    {cargando ? t('admin.procesando') : t('admin.btn_respaldo')}
                  </button>
                  <input type="file" id="input-restore" className="hidden" accept=".json" onChange={restaurarSistema} />
                  <button 
                    onClick={() => document.getElementById('input-restore').click()}
                    className="w-full bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-800 font-bold py-3 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                  >
                    {t('admin.btn_restaurar')}
                  </button>
                </div>
              </div>
            </div>

            {/* Automatización (PROG. RESPALDO) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b pb-3">
                <HiOutlineDatabase size={24} />
                <h2>{t('admin.prog_titulo')}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">{t('admin.label_frecuencia')}</label>
                  <select 
                    value={frecuencia} 
                    onChange={(e) => setFrecuencia(e.target.value)} 
                    className="w-full p-2.5 mt-1 text-sm border border-slate-200 rounded-lg cursor-pointer bg-white"
                  >
                    <option value="Diario">{t('admin.opt_diario')}</option>
                    <option value="Semanal">{t('admin.opt_semanal')}</option>
                    <option value="Mensual">{t('admin.opt_mensual')}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">{t('admin.label_hora')}</label>
                  <input 
                    type="time" 
                    value={horaRespaldo} 
                    onChange={(e) => setHoraRespaldo(e.target.value)}
                    className="w-full p-2 mt-1 text-sm border border-slate-200 rounded-lg cursor-pointer" 
                  />
                </div>
                <button 
                  onClick={handleGuardarConfig}
                  disabled={cargando}
                  className={`bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-[42px] rounded-lg text-sm transition-all ${cargando ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
                >
                  {cargando ? t('admin.guardando') : t('admin.btn_guardar')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDirector;