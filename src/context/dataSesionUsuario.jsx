import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sesion, setSesion] = useState(null);
  const [datosUsuario, setDatosUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  // Referencia para saber si ya estamos cargando datos y evitar duplicados
  const cargandoPerfil = useRef(false);

  const cerrarSesion = async () => {
    try {
      await supabase.auth.signOut();
      setSesion(null);
      setDatosUsuario(null);
    } catch (error) {
      // Solo errores críticos en consola
    }
  };

  const obtenerPerfil = async (uid) => {
    // Si ya hay datos del mismo usuario o ya estamos cargando, no repetimos
    if (cargandoPerfil.current || (datosUsuario && sesion?.id === uid)) return;
    
    cargandoPerfil.current = true;
    try {
      // Reducimos el timeout a 2 segundos para mayor agilidad
      const result = await Promise.race([
        supabase.from('usuario').select('*').eq('uid_fk', uid).single(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 2000))
      ]);

      const { data, error } = result;

      if (!error && data) {
        setDatosUsuario(data);
      } else {
        setDatosUsuario(null);
      }
    } catch (error) {
      setDatosUsuario(null);
    } finally {
      setCargando(false);
      cargandoPerfil.current = false;
    }
  };

  useEffect(() => {
    // onAuthStateChange maneja el evento INITIAL_SESSION automáticamente al suscribirse,
    // por lo que no necesitamos inicializarSesion aparte para evitar duplicidad.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setSesion(session.user);
        // Solo llamamos a obtenerPerfil si no tenemos los datos o cambió el usuario
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