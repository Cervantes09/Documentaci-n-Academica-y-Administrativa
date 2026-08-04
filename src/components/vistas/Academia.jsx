import React, { useState, useEffect } from 'react';
import { HiOutlineSpeakerphone, HiOutlineFolder, HiOutlineClock, HiOutlineUserGroup, HiOutlineExternalLink } from "react-icons/hi";
import { supabase } from '../../lib/supabase'; // Asegúrate de que esta ruta sea la correcta
import { useTranslation } from 'react-i18next'; // 🔥 Importamos el traductor

const Academia = () => {
  // 🔥 Inicializamos el traductor
  const { t } = useTranslation();

  // 1. ESTADOS PARA SUPABASE
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);

  // 2. FUNCIÓN PARA CARGAR LOS AVISOS
  const fetchAvisos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('AVISO')
        .select('*')
        .order('created_at', { ascending: false }); // Ordena del más nuevo al más viejo

      if (error) throw error;

      setNoticias(data || []);
    } catch (error) {
      console.error("Error al cargar los avisos:", error);
    } finally {
      setCargando(false);
    }
  };

  // 3. EJECUTAR AL ABRIR LA PÁGINA
  useEffect(() => {
    fetchAvisos();
  }, []);

  // 4. FUNCIÓN PARA DARLE COLOR A LAS ETIQUETAS
  const obtenerEstiloPorTipo = (tipo) => {
    switch (tipo) {
      case 'Urgente':
        return 'bg-red-100 text-red-600';
      case 'Evento':
        return 'bg-purple-100 text-purple-600';
      default: // Normal
        return 'bg-blue-100 text-blue-600';
    }
  };

  // Datos fijos para las Carpetas Compartidas
  const carpetas = [
    { id: 1, nombre: t('academia.carpeta_actas'), archivos: 12, color: "text-amber-500" },
    { id: 2, nombre: t('academia.carpeta_material'), archivos: 45, color: "text-emerald-500" },
    { id: 3, nombre: t('academia.carpeta_proyectos'), archivos: 8, color: "text-indigo-500" },
    { id: 4, nombre: t('academia.carpeta_evidencias'), archivos: 24, color: "text-rose-500" },
  ];

  return (
    <div className="space-y-6 md:space-y-10 pb-10">
      
      {/* --- SECCIÓN 1: FEED DE NOTICIAS --- */}
      <section className="space-y-3 md:space-y-4">
        <div className="flex items-center gap-2">
          <HiOutlineSpeakerphone className="text-emerald-600 w-5 h-5 md:w-6 md:h-6" size={24} />
          <h2 className="text-lg md:text-xl font-bold text-slate-800">{t('academia.avisos_titulo')}</h2>
        </div>

        <div className="grid gap-3 md:gap-4">
          {cargando ? (
            <div className="py-8 text-center text-slate-500 animate-pulse font-medium text-sm">
              {t('academia.cargando')}
            </div>
          ) : noticias.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 text-center text-slate-500 shadow-sm text-sm">
              {t('academia.sin_avisos')}
            </div>
          ) : (
            noticias.map((post) => (
              <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                      <HiOutlineUserGroup size={18} className="md:w-5 md:h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs md:text-sm font-bold text-slate-700">{t('academia.coordinacion')}</h3>
                      <p className="text-[10px] md:text-[11px] text-slate-400 flex items-center gap-1">
                        <HiOutlineClock size={12} /> {t('academia.publicado')}: {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg self-start sm:self-auto ${obtenerEstiloPorTipo(post.tipo)}`}>
                    {post.tipo}
                  </span>
                </div>
                
                <h4 className="text-sm md:text-base font-bold text-slate-800 mb-1.5 md:mb-2">{post.titulo}</h4>
                <p className="text-xs md:text-sm text-slate-600 leading-relaxed mb-3">{post.contenido}</p>
                
                <div className="bg-slate-50 p-2 rounded-lg inline-block">
                  <p className="text-[11px] md:text-xs font-bold text-slate-500">📅 {t('academia.fecha_programada')}: <span className="text-slate-700">{post.fecha_programada}</span></p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* --- SECCIÓN 2: CARPETAS COMPARTIDAS --- */}
      <section className="space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineFolder className="text-emerald-600 w-5 h-5 md:w-6 md:h-6" size={24} />
            <h2 className="text-lg md:text-xl font-bold text-slate-800">{t('academia.recursos_titulo')}</h2>
          </div>
          <button className="text-xs font-bold text-emerald-600 hover:underline">{t('academia.ver_todo')}</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {carpetas.map((folder) => (
            <div key={folder.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer group shadow-sm">
              <div className={`mb-2 md:mb-3 ${folder.color}`}>
                <HiOutlineFolder size={36} className="md:w-10 md:h-10" />
              </div>
              <h3 className="text-xs md:text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                {folder.nombre}
              </h3>
              <div className="mt-2 flex items-center justify-between text-[10px] md:text-[11px] text-slate-400">
                <span>{folder.archivos} {t('academia.elementos')}</span>
                <HiOutlineExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner Informativo */}
      <div className="bg-[#003d2b] rounded-2xl p-5 md:p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="text-center md:text-left">
          <h3 className="font-bold text-base md:text-lg text-emerald-400 mb-1">{t('academia.banner_titulo')}</h3>
          <p className="text-emerald-100/70 text-xs md:text-sm">{t('academia.banner_desc')}</p>
        </div>
        <button className="w-full md:w-auto bg-emerald-500 hover:bg-emerald-400 text-[#003d2b] px-6 py-2.5 rounded-xl font-black text-xs md:text-sm transition-all whitespace-nowrap shadow-sm">
          {t('academia.solicitar_acceso')}
        </button>
      </div>

    </div>
  );
};

export default Academia;