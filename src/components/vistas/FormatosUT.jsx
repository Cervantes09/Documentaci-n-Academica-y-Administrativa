import React, { useState, useEffect } from 'react';
import { HiOutlineDownload, HiOutlineSearch, HiOutlineDocumentText, HiOutlineFolderOpen, HiOutlineEye } from "react-icons/hi";
import { BiFileBlank } from "react-icons/bi";
import { supabase } from '../../lib/supabase';
import VistaArchivo from './VistaArchivo.jsx';
import { useTranslation } from 'react-i18next'; // 🔥 Importamos el traductor

const FormatosUT = () => {
  // 🔥 Inicializamos el traductor
  const { t } = useTranslation();

  const [busqueda, setBusqueda] = useState("");
  
  // Estados para base de datos, vista previa y descargas
  const [formatos, setFormatos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archivoParaVer, setArchivoParaVer] = useState(null);
  const [descargandoId, setDescargandoId] = useState(null);

  // Cargar formatos de la base de datos
  useEffect(() => {
    const fetchFormatos = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('DOCUMENTO')
          .select('*')
          .eq('tipo', 'Formato Oficial')
          .order('fecha', { ascending: false });

        if (error) throw error;
        setFormatos(data || []);
      } catch (error) {
        console.error("Error al cargar los formatos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormatos();
  }, []);

  // Función para adivinar si es PDF o Word basándonos en la URL
  const getTipoArchivo = (url) => {
    if (!url) return 'Desconocido';
    return url.toLowerCase().includes('.pdf') ? 'PDF' : 'Word';
  };

  // Fuerza la descarga directa sin abrir otra pestaña
  const forzarDescarga = async (url, nombreOriginal, id) => {
    try {
      setDescargandoId(id); 
      
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      
      const extension = url.split('.').pop().split('?')[0]; 
      link.download = `${nombreOriginal || t('formatos.nombre_default')}.${extension}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(blobUrl); 
    } catch (error) {
      console.error("Error al descargar:", error);
      alert(t('formatos.error_descarga'));
    } finally {
      setDescargandoId(null);
    }
  };

  // Filtro de búsqueda (Punto 1.3: Búsqueda)
  const formatosFiltrados = formatos.filter(f => 
    (f.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (f.clasificacion || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {/* Encabezado */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('formatos.titulo')}</h1>
        <p className="text-slate-500 text-sm">{t('formatos.subtitulo')}</p>
      </div>

      {/* Barra de Búsqueda */}
      <div className="relative max-w-md">
        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder={t('formatos.buscar_placeholder')}
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
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('formatos.col_documento')}</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('formatos.col_categoria')}</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{t('formatos.col_tipo')}</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider">{t('formatos.col_version')}</th>
              <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">{t('formatos.col_acciones')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-12 text-center text-slate-400 font-medium animate-pulse">
                  {t('formatos.cargando')}
                </td>
              </tr>
            ) : formatosFiltrados.length > 0 ? (
              formatosFiltrados.map((formato) => {
                const tipoExt = getTipoArchivo(formato.archivo);
                return (
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
                        {formato.clasificacion || t('formatos.categoria_general')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        tipoExt === 'PDF' ? 'border-red-200 text-red-600 bg-red-50' : 'border-blue-200 text-blue-600 bg-blue-50'
                      }`}>
                        {tipoExt}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-400 font-mono">
                      {formato.fecha ? new Date(formato.fecha).toLocaleDateString() : t('formatos.sin_fecha')}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => setArchivoParaVer(formato)}
                          className="inline-flex items-center justify-center p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('formatos.vista_previa')}
                        >
                          <HiOutlineEye size={20} />
                        </button>
                        
                        {formato.archivo && (
                          <button 
                            onClick={() => forzarDescarga(formato.archivo, formato.nombre, formato.id)}
                            disabled={descargandoId === formato.id}
                            className={`inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold text-sm transition-colors p-2 rounded-lg ${descargandoId === formato.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-emerald-50'}`}
                            title={t('formatos.descargar')}
                          >
                            <HiOutlineDownload size={18} />
                            <span className="hidden sm:inline">
                              {descargandoId === formato.id ? t('formatos.descargando') : t('formatos.descargar')}
                            </span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="p-12 text-center text-slate-400 italic">
                  {t('formatos.sin_resultados')}
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
          <b>{t('formatos.nota')}</b> {t('formatos.nota_texto')}
        </p>
      </div>

      {/* Componente para Vista Previa */}
      <VistaArchivo 
        archivo={archivoParaVer} 
        onClose={() => setArchivoParaVer(null)} 
      />
    </div>
  );
};

export default FormatosUT;