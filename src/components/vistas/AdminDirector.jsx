import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { 
  HiOutlineUserAdd, 
  HiOutlineTrash, 
  HiOutlineCheck, 
  HiOutlineDocumentReport, 
  HiOutlineDatabase 
} from "react-icons/hi";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const TAB_INDEX = { usuarios: 0, reportes: 1 };

const AdminDirector = () => {
  const [tabActiva, setTabActiva] = useState('usuarios');
  const [direccion, setDireccion] = useState('derecha');
  const [cargando, setCargando] = useState(false);
  
  // Estados de configuración con valores iniciales
  const [horaRespaldo, setHoraRespaldo] = useState("02:00");
  const [frecuencia, setFrecuencia] = useState("Diario");

  // Estado real de usuarios pendientes
  const [usuariosPendientes, setUsuariosPendientes] = useState([]);

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
      
      alert(`✅ Usuario aprobado y asignado como ${nuevoRol.toUpperCase()}.`);
      // Remover de la vista actual filtrando por usuarioid
      setUsuariosPendientes(prev => prev.filter(u => u.usuarioid !== user.usuarioid));
    } catch (error) {
      alert("❌ Error al asignar rol: " + error.message);
    }
  };

  const eliminarUsuario = async (user) => {
    const confirmar = window.confirm("¿Estás seguro de rechazar y eliminar este usuario por completo?");
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

      alert("✅ Usuario eliminado del sistema.");
      // Actualizamos la vista
      setUsuariosPendientes(prev => prev.filter(u => u.usuarioid !== user.usuarioid));
    } catch (error) {
      alert("❌ Error al eliminar usuario: " + error.message);
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
      alert("✅ Configuración guardada en DB y Programador (Cron)");
    } catch (error) {
      alert("❌ Error: " + error.message);
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
      const tablas = ['DOCUMENTO', 'AVISO', 'configuracion_sistema', 'usuario']; 
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
      
      alert("✅ Respaldo generado con éxito.");
    } catch (error) {
      console.error(error);
      alert("❌ Error al generar respaldo.");
    } finally {
      setCargando(false);
    }
  };

  const restaurarSistema = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const confirmar = window.confirm("¿Estás seguro? Esto sobrescribirá o actualizará los datos actuales.");
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
        alert("✅ Sistema restaurado correctamente.");
        window.location.reload(); 
      } catch (error) {
        console.error(error);
        alert("❌ Error: El archivo no es válido.");
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
        alert("No hay documentos registrados en este mes.");
        return;
      }

      const doc = new jsPDF();
      autoTable(doc, {
        startY: 35,
        head: [['Nombre del Documento', 'Autor (Docente)', 'Fecha de Entrega']],
        body: documentos.map(d => [
          d.nombre,
          d.autor?.nombre || 'Docente no asignado',
          new Date(d.fecha).toLocaleString()
        ]),
        headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 255, 250] },
        styles: { fontSize: 10, cellPadding: 3 },
        didDrawPage: (data) => {
          doc.setFontSize(18);
          doc.setTextColor(5, 150, 105);
          doc.text(`Reporte de Documentos - ${new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(hoy)}`, 14, 20);
          doc.setFontSize(10);
          doc.setTextColor(100);
          doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);
        }
      });
      doc.save(`Reporte_Mensual_${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Error crítico al generar el reporte: " + error.message);
    }
  }; 

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-800">Panel del Director Supremo</h1>
        <p className="text-slate-500 text-sm">Control total de privilegios, reportes institucionales y base de datos.</p>
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
          <span className="hidden md:inline truncate">Autorizar Usuarios</span>
          {tabActiva === 'usuarios' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />}
        </button>

        <button
          onClick={() => cambiarTab('reportes')}
          className={`flex items-center justify-center gap-2 py-4 px-2 font-bold text-sm transition-all duration-300 relative flex-1 cursor-pointer ${
            tabActiva === 'reportes' ? 'text-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <HiOutlineDocumentReport size={24} className="flex-shrink-0" />
          <span className="hidden md:inline truncate">Reportes y DB</span>
          {tabActiva === 'reportes' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-600" />}
        </button>
      </div>

      <div className="relative min-h-[500px] overflow-hidden">
        {/* VISTA 1: USUARIOS */}
        {tabActiva === 'usuarios' && (
          <div className={`animate-slide-in-${direccion === 'derecha' ? 'right' : 'left'} w-full space-y-6`}>
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-700">Usuarios Esperando Aprobación de Rol</h2>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left min-w-[650px] md:min-w-full">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                    <tr>
                      <th className="px-6 py-3">Nombre</th>
                      <th className="px-6 py-3">Correo</th>
                      <th className="px-6 py-3 text-center">Asignar Rol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {usuariosPendientes.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-6 py-10 text-center text-slate-400 text-sm">No hay usuarios pendientes.</td>
                      </tr>
                    ) : (
                      usuariosPendientes.map((user) => (
                        <tr key={user.usuarioid} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">{user.nombre}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">{user.correo || 'Cargando...'}</td>
                          <td className="px-6 py-4 flex justify-center gap-2">
                            <button onClick={() => cambiarRol(user, 'docente')} className="flex items-center gap-1 p-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors text-xs font-bold cursor-pointer">
                              <HiOutlineCheck size={16} /> Docente
                            </button>
                            <button onClick={() => cambiarRol(user, 'administrativo')} className="flex items-center gap-1 p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-xs font-bold cursor-pointer">
                              <HiOutlineUserAdd size={16} /> Administrativo
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
          <div className={`animate-slide-in-${direccion === 'derecha' ? 'right' : 'left'} w-full space-y-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 font-bold border-b pb-3">
                  <HiOutlineDocumentReport size={24} />
                  <h2>Generar Reportes Oficiales</h2>
                </div>
                <div className="space-y-2">
                  <button onClick={generarReportePDF} className="w-full bg-slate-800 hover:bg-slate-900 cursor-pointer text-white font-bold py-3 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                    📄 Reporte de Documentos Entregados
                  </button>
                  <button className="w-full bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-800 font-bold py-3 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                    📄 Reporte de Logs
                  </button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-amber-600 font-bold border-b pb-3">
                  <HiOutlineDatabase size={24} />
                  <h2>Gestión de Base de Datos</h2>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={generarBackup}
                    disabled={cargando}
                    className={`w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 ${cargando ? 'cursor-wait opacity-50' : 'cursor-pointer'}`}
                  >
                    {cargando ? '⌛ Procesando...' : '⚙️ Generar Respaldo Manual (Backup)'}
                  </button>
                  <input type="file" id="input-restore" className="hidden" accept=".json" onChange={restaurarSistema} />
                  <button 
                    onClick={() => document.getElementById('input-restore').click()}
                    className="w-full bg-slate-100 hover:bg-slate-200 cursor-pointer text-slate-800 font-bold py-3 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2"
                  >
                    🔄 Restaurar Sistema de un punto anterior
                  </button>
                </div>
              </div>
            </div>

            {/* Automatización (PROG. RESPALDO) */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-slate-800 font-bold border-b pb-3">
                <HiOutlineDatabase size={24} />
                <h2>Programación de respaldos automatizados</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Frecuencia</label>
                  <select 
                    value={frecuencia} 
                    onChange={(e) => setFrecuencia(e.target.value)} 
                    className="w-full p-2.5 mt-1 text-sm border border-slate-200 rounded-lg cursor-pointer bg-white"
                  >
                    <option value="Diario">Diario</option>
                    <option value="Semanal">Semanal (Fines de semana)</option>
                    <option value="Mensual">Mensual</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 uppercase">Hora de ejecución</label>
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
                  {cargando ? 'Guardando...' : 'Guardar Configuración'}
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