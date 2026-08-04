import React, { useState, useEffect } from 'react';
import { HiOutlineDocumentText, HiOutlineCloudUpload, HiOutlineCheckCircle, HiOutlineClock, HiOutlinePrinter } from "react-icons/hi";
import SubirArchivo from './SubirArchivo.jsx'; // Tu componente del modal
import { supabase } from '../../lib/supabase'; // Importación de Supabase
import { useTranslation } from 'react-i18next'; // 🔥 1. Importamos el traductor
// 🔥 Importamos componentes de Recharts para la gráfica de distribución
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PanelDashboard = () => {

  // 🔥 2. Inicializamos el traductor
  const { t } = useTranslation();

  // 1. Estado para controlar si el modal está abierto o cerrado
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estado para guardar los documentos reales de la BD
  const [documentos, setDocumentos] = useState([]);
  const [descargandoId, setDescargandoId] = useState(null);
  const [generandoReporte, setGenerandoReporte] = useState(false);

  // Efecto para obtener los datos al cargar el Dashboard
  useEffect(() => {
    let activo = true;

    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: perfil } = await supabase
            .from('usuario')
            .select('usuarioid')
            .eq('uid_fk', user.id)
            .single();

          if (perfil) {
            // Traemos TODOS los documentos del usuario para hacer los cálculos
            const { data, error } = await supabase
              .from('DOCUMENTO')
              .select('*')
              .eq('usuarioFK', perfil.usuarioid)
              .order('fecha', { ascending: false });

            if (!activo) return;
            if (error) console.error("Error al obtener documentos para dashboard:", error);
            else setDocumentos(data || []);
          }
        }
      } catch (err) {
        console.error("Error general en dashboard:", err);
      }
    };

    fetchData();
    return () => { activo = false; };
  }, []);

  // Función para recargar la tabla después de subir un archivo nuevo
  const recargar = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: perfil } = await supabase
            .from('usuario')
            .select('usuarioid')
            .eq('uid_fk', user.id)
            .single();

          if (perfil) {
            const { data, error } = await supabase
              .from('DOCUMENTO')
              .select('*')
              .eq('usuarioFK', perfil.usuarioid)
              .order('fecha', { ascending: false });

            if (!error) setDocumentos(data || []);
          }
        }
      } catch (err) {
        console.error("Error al recargar dashboard:", err);
      }
  };

  // Función para descargar desde la tabla
  const forzarDescarga = async (url, nombreOriginal, id) => {
    try {
      setDescargandoId(id);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const extension = url.split('.').pop().split('?')[0];
      link.download = `${nombreOriginal || t('dashboard.documento_default')}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error al descargar:", error);
      alert(t('dashboard.alert_error_descarga'));
    } finally {
      setDescargandoId(null);
    }
  };

  // 🔥 NUEVA FUNCIONALIDAD: Generar Reporte de Documentos Personales
  const generarReportePersonal = () => {
    if (documentos.length === 0) {
      alert(t('dashboard.sin_docs') || "No hay documentos para generar el reporte.");
      return;
    }

    setGenerandoReporte(true);
    try {
      // Creamos una ventana emergente con el diseño del reporte listo para imprimir o guardar como PDF
      const ventanaReporte = window.open('', '_blank');
      
      const contenidoHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Reporte de Documentos Personales</title>
          <style>
            body { font-family: Arial, sans-serif; color: #333; margin: 40px; }
            h1 { color: #059669; font-size: 24px; margin-bottom: 5px; }
            p.sub { color: #666; font-size: 14px; margin-top: 0; }
            .stats { display: flex; gap: 20px; margin: 20px 0; }
            .stat-card { background: #f3f4f6; padding: 15px; border-radius: 8px; flex: 1; text-align: center; }
            .stat-card h3 { margin: 0; font-size: 14px; color: #555; text-transform: uppercase; }
            .stat-card p { margin: 5px 0 0; font-size: 20px; font-weight: bold; color: #111; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; font-size: 13px; }
            th { background-color: #059669; color: white; }
            tr:nth-child(even) { background-color: #f9fafb; }
            .badge { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; display: inline-block; }
            .Validado { background: #d1fae5; color: #065f46; }
            .Pendiente { background: #fef3c7; color: #92400e; }
            .Rechazado { background: #fee2e2; color: #991b1b; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <h1>Reporte General de Documentos Personales</h1>
          <p class="sub">Fecha de emisión: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}</p>
          
          <div class="stats">
            <div class="stat-card">
              <h3>Total Documentos</h3>
              <p>${totalDocs}</p>
            </div>
            <div class="stat-card">
              <h3>Validados</h3>
              <p>${validados}</p>
            </div>
            <div class="stat-card">
              <h3>Pendientes</h3>
              <p>${pendientes}</p>
            </div>
            <div class="stat-card">
              <h3>Rechazados</h3>
              <p>${rechazadosCount}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nombre del Documento</th>
                <th>Tipo</th>
                <th>Fecha de Registro</th>
                <th>Estatus</th>
              </tr>
            </thead>
            <tbody>
              ${documentos.map(doc => `
                <tr>
                  <td>${doc.nombre || doc.archivo?.split('/').pop() || 'Documento'}</td>
                  <td><b>${doc.tipo || 'N/A'}</b></td>
                  <td>${new Date(doc.fecha).toLocaleDateString()}</td>
                  <td><span class="badge ${doc.estado || 'Pendiente'}">${doc.estado || 'Pendiente'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Este reporte es un documento informativo generado desde el sistema de gestión de documentos.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `;

      ventanaReporte.document.write(contenidoHTML);
      ventanaReporte.document.close();
    } catch (error) {
      console.error("Error al generar reporte:", error);
      alert("Ocurrió un error al generar el reporte.");
    } finally {
      setGenerandoReporte(false);
    }
  };

  // Cálculos dinámicos para las Cards
  const totalDocs = documentos.length;
  
  // Calculamos los subidos hoy (comparando solo la fecha, sin horas)
  const fechaHoy = new Date().toLocaleDateString();
  const subidosHoy = documentos.filter(doc => new Date(doc.fecha).toLocaleDateString() === fechaHoy).length;
  
  const validados = documentos.filter(doc => doc.estado === 'Validado').length;
  const pendientes = documentos.filter(doc => doc.estado === 'Pendiente').length;
  const rechazadosCount = documentos.filter(doc => doc.estado === 'Rechazado').length;

  // Datos dinámicos para las Cards
  const stats = [
    { label: t('dashboard.stat_total'), value: totalDocs.toString(), icon: <HiOutlineDocumentText size={24}/>, color: "text-blue-600", bg: "bg-blue-100" },
    { label: t('dashboard.stat_hoy'), value: subidosHoy.toString(), icon: <HiOutlineCloudUpload size={24}/>, color: "text-emerald-600", bg: "bg-emerald-100" },
    { label: t('dashboard.stat_validados'), value: validados.toString(), icon: <HiOutlineCheckCircle size={24}/>, color: "text-purple-600", bg: "bg-purple-100" },
    { label: t('dashboard.stat_pendientes'), value: pendientes.toString(), icon: <HiOutlineClock size={24}/>, color: "text-amber-600", bg: "bg-amber-100" },
  ];

  // Obtenemos solo los 5 más recientes para la Tabla
  const recentFiles = documentos.slice(0, 5);

  // Preparamos los datos para la gráfica de pastel (distribución de documentos por estatus)
  const datosGraficaEstado = [
    { name: 'Validados', value: validados, color: '#059669' },
    { name: 'Pendientes', value: pendientes, color: '#F2D700' },
    { name: 'Rechazados', value: rechazadosCount, color: '#DC2626' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-8">
      {/* Header de Bienvenida con Botón de Generar Reporte */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('dashboard.titulo')}</h1>
          <p className="text-slate-500 text-sm">{t('dashboard.subtitulo')}</p>
        </div>
        
        {/* 🔥 Botón para generar reporte */}
        <button
          onClick={generarReportePersonal}
          disabled={generandoReporte || documentos.length === 0}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50 text-sm"
        >
          <HiOutlinePrinter size={18} />
          {generandoReporte ? (t('dashboard.btn_generando') || 'Generando...') : (t('dashboard.btn_generar_reporte') || 'Generar Reporte')}
        </button>
      </header>

      {/* Sección de Cards  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 cursor-pointer">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white hover:bg-gray-100 p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* SECCIÓN DE LA GRÁFICA DE DISTRIBUCIÓN */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-emerald-600 font-bold border-b pb-3">
          <HiOutlineDocumentText size={24} />
          <h2>Distribución de Documentos por Estatus</h2>
        </div>
        <div className="w-full h-64 mt-2">
          {documentos.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              {t('dashboard.sin_docs')}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={datosGraficaEstado}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {datosGraficaEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Tabla de Archivos Recientes  */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="font-bold text-slate-700">{t('dashboard.docs_recientes')}</h2>
          <button className="text-emerald-600 text-sm font-bold hover:underline cursor-pointer">{t('dashboard.ver_todos')}</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 font-semibold">{t('dashboard.tabla_nombre')}</th>
                <th className="px-6 py-3 font-semibold">{t('dashboard.tabla_tipo')}</th>
                <th className="px-6 py-3 font-semibold">{t('dashboard.tabla_fecha')}</th>
                <th className="px-6 py-3 font-semibold">{t('dashboard.tabla_estatus')}</th>
                <th className="px-6 py-3 font-semibold text-center">{t('dashboard.tabla_acciones')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentFiles.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-400 text-sm">
                    {t('dashboard.sin_docs')}
                  </td>
                </tr>
              ) : (
                recentFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {file.nombre || file.archivo?.split('/').pop() || t('dashboard.documento_default')}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold uppercase">{file.tipo}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">{new Date(file.fecha).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full
                        ${file.estado === 'Validado' ? 'bg-emerald-100 text-emerald-700' :
                          file.estado === 'Pendiente' ? 'bg-amber-100 text-amber-700' :
                          file.estado === 'Rechazado' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                        {file.estado || t('dashboard.estado_pendiente')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => forzarDescarga(file.archivo, file.nombre, file.id)}
                        disabled={descargandoId === file.id || file.estado === 'Rechazado'}
                        className="text-emerald-600 hover:text-emerald-800 font-bold text-xs cursor-pointer disabled:opacity-50"
                      >
                        {descargandoId === file.id ? t('dashboard.btn_descargando') : t('dashboard.btn_descargar')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Botón Flotante de Subida */}
      <button className="fixed bottom-8 right-8 bg-emerald-600 text-white p-4 rounded-full shadow-xl hover:bg-emerald-700 hover:scale-110 transition-all group"
        onClick={() => setIsModalOpen(true)}>
        <HiOutlineCloudUpload size={28} />
        <span className="absolute right-full mr-3 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {t('dashboard.tooltip_subir')}
        </span>
      </button>

      {/* Componente del Modal */}
      <SubirArchivo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={recargar}
      />

    </div>
  );
};

export default PanelDashboard;