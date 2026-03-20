import React from 'react';
import { FcGoogle } from "react-icons/fc";
import logo from '../../assets/logo.png';

const Login = ({ onLogin }) => {
  return (

    <div className="h-screen w-full flex overflow-hidden bg-white">
      
      {/* SECCIÓN IZQUIERDA: Identidad Visual (50% ancho) */}
      <div className="hidden lg:flex w-1/2 bg-[#003d2b] flex-col justify-between p-12 relative">
        {/* Logo en la esquina superior */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="UT" className="w-12" />
          <div className="h-10 w-[1px] bg-emerald-500/30"></div>
          <span className="text-white font-bold tracking-widest text-sm">UT NAYARIT</span>
        </div>

        {/* Texto Central */}
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Gestión de <br />
            <span className="text-emerald-400">Documentos</span>
          </h1>
          <p className="text-emerald-100/70 text-lg max-w-sm">
            Acceso exclusivo para docentes de la Ingeniería en Desarrollo y Gestión de Software.
          </p>
        </div>

        {/* Footer de la sección verde */}
        <div className="text-emerald-500/50 text-xs font-medium">
          PROYECTO INTEGRADOR • IDGS 2026
        </div>

        {/* Elemento decorativo sutil (Círculo de fondo) */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>

      {/* SECCIÓN DERECHA: Login (50% ancho) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-[400px]">
          
          {/* Mobile Logo */}
          <img src={logo} alt="Logo" className="w-20 lg:hidden mx-auto mb-8" />

          <div className="mb-10">
            <h2 className="text-4xl font-bold text-slate-900 mb-3 text-center lg:text-left">Bienvenido</h2>
            <p className="text-slate-500 text-center lg:text-left">
              Por favor, utiliza tu cuenta institucional para ingresar al repositorio.
            </p>
          </div>

          {/* Botón de Google (Punto 1.1: Autentificación) */}
          <button
            onClick={onLogin}
            className="group w-full flex items-center justify-between bg-white border-2 border-slate-100 p-2 pr-6 rounded-2xl transition-all hover:border-emerald-500 cursor-pointer hover:bg-emerald-50/30 active:scale-[0.98]"
          >
            <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-white transition-colors">
              <FcGoogle size={28} />
            </div>
            <span className="text-slate-700 font-bold text-lg">Entrar con Google</span>
            <span></span> {/* Espaciador para centrar el texto */}
          </button>

          {/* Aviso de Seguridad (Capítulo 8.4) */}
          <div className="mt-8 p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex gap-4 items-start">
            <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0"></div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Sistema protegido por <b>Supabase Auth</b>. Solo se admiten dominios <span className="text-emerald-700 font-bold">@utnay.edu.mx</span>. 
              Tus sesiones son monitoreadas para cumplir con los estándares de ciberseguridad.
            </p>
          </div>

          <p className="mt-12 text-center text-[10px] text-slate-300 uppercase tracking-[0.2em] font-bold">
            Universidad Tecnológica de Nayarit
          </p>
        </div>
      </div>

    </div>
  );
};

export default Login;