import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sesion, setSesion] = useState(null);
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const cargandoPerfil = useRef(false);

  const cerrarSesion = async () => {
    try {
      await supabase.auth.signOut();
      setSesion(null);
      setDatosUsuario(null);
    } catch (error) { /* Error silencioso */ }
  };

  const obtenerPerfil = async (uid) => {
    if (cargandoPerfil.current) return;
    cargandoPerfil.current = true;
    
    try {
      const result = await Promise.race([
        supabase.from('usuario').select('*').eq('uid_fk', uid).single(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 1000))
      ]);

      if (result.data) setDatosUsuario(result.data);
    } catch (e) {
      console.log("Cargando sesion...");
    } finally {
      setCargando(false);
      cargandoPerfil.current = false;
    }
  };

  useEffect(() => {
    // 1. Chequeo inicial rápido
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setSesion(session.user);
          await obtenerPerfil(session.user.id);
        } else {
          setCargando(false);
        }
      } catch (err) {
        setCargando(false);
      }
    };

    checkSession();

    // 2. Listener de cambios de estado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignorar errores de "futuro" y simplemente intentar cargar si hay sesión
      if (session) {
        setSesion(session.user);
        await obtenerPerfil(session.user.id);
      } else {
        setSesion(null);
        setDatosUsuario(null);
        setCargando(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SessionContext.Provider value={{ sesion, datosUsuario, cargando, cerrarSesion }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);