import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [sesion, setSesion] = useState(null); // Datos de AUTH
  const [datosUsuario, setDatosUsuario] = useState(null); // Datos de tu tabla usuario
  const [cargando, setCargando] = useState(true);

  // --- FUNCIÓN PARA CERRAR SESIÓN (NUEVA) ---
  const cerrarSesion = async () => {
    try {
      await supabase.auth.signOut();
      // Limpiamos los estados localmente para una respuesta inmediata de la UI
      setSesion(null);
      setDatosUsuario(null);
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  // Función para jalar los datos de tu tabla usuario
  const obtenerPerfil = async (uid) => {
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('uid_fk', uid)
        .single();

      if (error) {
        console.warn("No se encontró perfil para este UID.");
        setDatosUsuario(null);
      } else {
        setDatosUsuario(data);
      }
    } catch (error) {
      console.error("Error crítico al obtener perfil:", error.message);
      setDatosUsuario(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const inicializarSesion = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSesion(session.user);
        await obtenerPerfil(session.user.id);
      } else {
        setSesion(null);
        setDatosUsuario(null);
        setCargando(false);
      }
    };

    inicializarSesion();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
    // Agregamos cerrarSesion al value para que sea accesible globalmente
    <SessionContext.Provider value={{ sesion, datosUsuario, cargando, cerrarSesion }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);