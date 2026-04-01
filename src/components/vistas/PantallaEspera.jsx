import React from 'react';
import { supabase } from '../../lib/supabase';
import { useSession } from '../../context/dataSesionUsuario';

const PantallaEspera = () => {
  const { datosUsuario } = useSession();

  // Obtenemos solo el primer nombre para un saludo más amigable
  const primerNombre = datosUsuario?.nombre?.split(' ')[0] || 'Usuario';

  return (
    // min-h-screen con p-2 para que en móviles no toque los bordes
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-2 sm:p-4 antialiased selection:bg-emerald-100">
      
      {/* Tarjeta Principal: max-w-md para que no sea gigante, p-6 a 10 para balancear */}
      <div className="w-full max-w-md bg-white p-6 md:p-10 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-slate-100 transform transition-all">
        
        {/* Sección del Icono: mb-6 para ahorrar espacio vertical */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full bg-amber-100 animate-pulse opacity-70 scale-110"></div>
          
          <div className="relative w-16 h-16 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 animate-spin-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Textos: Reducimos el space-y para que sea más compacto */}
        <div className="space-y-3 text-center">
          <p className="text-[10px] sm:text-xs font-bold text-amber-600 tracking-[0.2em] uppercase">
            Acceso en Revisión
          </p>
          
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">
            ¡Hola, {primerNombre}!
          </h2>
          
          <p className="text-sm md:text-base text-slate-600 leading-relaxed max-w-[280px] sm:max-w-xs mx-auto">
            Tu cuenta ha sido creada. <span className="text-slate-900 font-medium">Por seguridad</span>, debes esperar a que tu <span className="font-semibold text-emerald-600">Director de Carrera</span> verifique tu identidad.
          </p>
        </div>

        {/* Sección de Acción: mt-8 para que suba un poco el botón */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 mb-4">
            ¿Usaste la cuenta equivocada?
          </p>
          
          <button 
            onClick={() => supabase.auth.signOut()}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold transition-all duration-300 active:scale-95 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            CERRAR SESIÓN
          </button>
        </div>
      </div>

      {/* Footer sutil: mt-6 para que no se pegue abajo pero no empuje hacia afuera */}
      <p className="mt-6 text-[10px] text-slate-400 font-medium tracking-wide">
        REPOSITORIO INSTITUCIONAL | UT NAYARIT
      </p>
    </div>
  );
};

export default PantallaEspera;