import React, { useState } from 'react';
import { FcGoogle } from "react-icons/fc";
import logo from '../../assets/logo.png';
import { supabase } from '../../lib/supabase';

const Login = () => {
  const [loading, setLoading] = useState(false);

  const handleLoginWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            hd: 'utnay.edu.mx', // Sugiere el dominio en la ventana de Google
          },
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      
    } catch (error) {
      // Si el trigger de la base de datos rechaza el correo, caerá aquí al instante
      console.error("Error de autenticación:", error.message);
      alert("Acceso denegado: " + (error.message || "Solo correos institucionales."));
      setLoading(false); 
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-white">
      
      {/* SECCIÓN IZQUIERDA: Identidad Visual */}
      <div className="hidden lg:flex w-1/2 bg-[#003d2b] flex-col justify-between p-12 relative">
        <div className="flex items-center gap-3">
          <img src={logo} alt="UT" className="w-12" />
          <div className="h-10 w-[1px] bg-emerald-500/30"></div>
          <span className="text-white font-bold tracking-widest text-sm uppercase">UT Nayarit</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white leading-tight mb-6">
            Gestión de <br />
            <span className="text-emerald-400">Documentos</span>
          </h1>
          <p className="text-emerald-100/70 text-lg max-w-sm font-medium">
            Acceso exclusivo para docentes de la Ingeniería en Desarrollo y Gestión de Software.
          </p>
        </div>

        <div className="text-emerald-500/50 text-xs font-medium uppercase tracking-widest">
          Proyecto Integrador • IDGS 2026
        </div>

        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50"></div>
      </div>

      {/* SECCIÓN DERECHA: Formulario de Acceso */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8">
        <div className="w-full max-w-[400px]">
          
          <img src={logo} alt="Logo" className="w-20 lg:hidden mx-auto mb-8" />

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Bienvenido</h2>
            <p className="text-slate-500 font-medium">
              Utiliza tu cuenta institucional para ingresar al repositorio.
            </p>
          </div>

          {/* BOTÓN DE ACCESO */}
          <button
            onClick={handleLoginWithGoogle}
            disabled={loading}
            className={`group w-full flex items-center justify-between bg-white border-2 border-slate-100 p-2 pr-6 rounded-2xl transition-all hover:border-emerald-500 cursor-pointer hover:bg-emerald-50/30 active:scale-[0.98] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-white transition-colors shadow-sm">
              <FcGoogle size={28} />
            </div>
            <span className="text-slate-700 font-bold text-lg">
              {loading ? 'Conectando...' : 'Entrar con Google'}
            </span>
            <div className="w-7"></div> 
          </button>

          {/* AVISO DE SEGURIDAD */}
          <div className="mt-8 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex gap-4 items-start shadow-sm shadow-slate-100/50">
            <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse"></div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              Sistema protegido por <b>Supabase Auth (JWT)</b>. Solo se admiten dominios <span className="text-emerald-700 font-bold">@utnay.edu.mx</span>. 
              Tus accesos son registrados en los logs de auditoría para el cumplimiento de seguridad institucional.
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