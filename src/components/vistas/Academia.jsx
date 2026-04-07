import React, { useState, useEffect } from 'react';
import { HiOutlineSpeakerphone, HiOutlineFolder, HiOutlineClock, HiOutlineUserGroup, HiOutlineExternalLink } from "react-icons/hi";
import { supabase } from '../../lib/supabase'; // Asegúrate de que esta ruta sea la correcta

const Academia = () => {
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

  // Datos fijos para las Carpetas Compartidas (Esto lo dejamos igual por ahora)
  const carpetas = [
    { id: 1, nombre: "Actas de Academia 2026", archivos: 12, color: "text-amber-500" },
    { id: 2, nombre: "Material Didáctico Común", archivos: 45, color: "text-emerald-500" },
    { id: 3, nombre: "Proyectos Integradores", archivos: 8, color: "text-indigo-500" },
    { id: 4, nombre: "Evidencias de Auditoría", archivos: 24, color: "text-rose-500" },
  ];

  return (
    <div className="space-y-10 pb-10">
      
      {/* --- SECCIÓN 1: FEED DE NOTICIAS --- */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HiOutlineSpeakerphone className="text-emerald-600" size={24} />
          <h2 className="text-xl font-bold text-slate-800">Avisos de Academia</h2>
        </div>

        <div className="grid gap-4">
          {cargando ? (
            <div className="py-8 text-center text-slate-500 animate-pulse font-medium">
              Cargando avisos recientes...
            </div>
          ) : noticias.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-sm">
              No hay avisos nuevos en la Academia.
            </div>
          ) : (
            noticias.map((post) => (
              <div key={post.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <HiOutlineUserGroup size={20} />
                    </div>
                    <div>
                      {/* Como no guardamos un autor, le ponemos un texto genérico oficial */}
                      <h3 className="text-sm font-bold text-slate-700">Coordinación Académica</h3>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <HiOutlineClock size={12} /> Publicado: {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${obtenerEstiloPorTipo(post.tipo)}`}>
                    {post.tipo}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-800 mb-2">{post.titulo}</h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-3">{post.contenido}</p>
                <div className="bg-slate-50 p-2 rounded-lg inline-block">
                  <p className="text-xs font-bold text-slate-500">📅 Fecha Programada: <span className="text-slate-700">{post.fecha_programada}</span></p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* --- SECCIÓN 2: CARPETAS COMPARTIDAS --- */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiOutlineFolder className="text-emerald-600" size={24} />
            <h2 className="text-xl font-bold text-slate-800">Recursos Compartidos</h2>
          </div>
          <button className="text-xs font-bold text-emerald-600 hover:underline">Ver todo</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {carpetas.map((folder) => (
            <div key={folder.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all cursor-pointer group">
              <div className={`mb-3 ${folder.color}`}>
                <HiOutlineFolder size={40} />
              </div>
              <h3 className="text-sm font-bold text-slate-700 group-hover:text-emerald-700 transition-colors">
                {folder.nombre}
              </h3>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>{folder.archivos} elementos</span>
                <HiOutlineExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banner Informativo */}
      <div className="bg-[#003d2b] rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-lg text-emerald-400">¿Necesitas compartir algo?</h3>
          <p className="text-emerald-100/70 text-sm">Envía tus documentos a coordinación para publicarlos en las carpetas comunes.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-400 text-[#003d2b] px-6 py-2 rounded-xl font-black text-sm transition-all whitespace-nowrap">
          SOLICITAR ACCESO
        </button>
      </div>

    </div>
  );
};

export default Academia;