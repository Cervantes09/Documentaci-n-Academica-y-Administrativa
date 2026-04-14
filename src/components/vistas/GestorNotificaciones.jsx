import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AvisoDocumento from './AvisoDocumento';
import { useTranslation } from 'react-i18next'; // 🔥 1. Importamos el traductor

const GestorNotificaciones = () => {
  // 🔥 2. Inicializamos el traductor
  const { t } = useTranslation();

  const [notificaciones, setNotificaciones] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);

  useEffect(() => {
    const fetchNotificaciones = async () => {
      try {
        // 1. Obtener el usuario de la sesión actual
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 2. Buscar su ID interno en la tabla usuario
        const { data: perfil } = await supabase
          .from('usuario')
          .select('usuarioid')
          .eq('uid_fk', user.id)
          .single();

        if (perfil) {
          // 3. Traer los LOGS con filtros en MAYÚSCULAS
          const { data, error } = await supabase
            .from('LOGS')
            .select('*')
            .eq('propietarioDoc', perfil.usuarioid)
            .in('operacion', ['ACCEPT', 'DECLINE']) // <-- CAMBIO A MAYÚSCULAS
            .eq('visto', false)
            .order('created_at', { ascending: true });

          if (error) {
            console.error("Error de Supabase al traer logs:", error.message);
          }

          if (data) {
            console.log("Notificaciones encontradas:", data); // Para debugear
            setNotificaciones(data);
          }
        }
      } catch (error) {
        console.error("Error general al cargar notificaciones:", error);
      }
    };

    fetchNotificaciones();
  }, []);

 const manejarSiguiente = async () => {
    const actual = notificaciones[indiceActual];
    console.log("Intentando actualizar notificación ID:", actual.id);
    
    try {
      // Marcar como visto en la base de datos y pedir el registro actualizado
      const { data, error } = await supabase
        .from('LOGS')
        .update({ visto: true })
        .eq('id', actual.id)
        .select(); // <-- ESTO ES CLAVE PARA DEBUGEAR

      if (error) {
        console.error("Error de Supabase:", error.message);
        throw error;
      }

      // Si data está vacío, significa que RLS bloqueó el UPDATE
      if (data && data.length === 0) {
        console.error("⛔ ALERTA: RLS bloqueó la actualización. No tienes permisos de UPDATE para este ID.");
        // No avanzamos el índice para que te des cuenta del error
        return; 
      }

      console.log("✅ Éxito, registro actualizado en BD:", data);
      
      // Pasar al siguiente en la cola local solo si la BD se actualizó
      setIndiceActual(prev => prev + 1);
    } catch (err) {
      console.error("Error al marcar como visto:", err.message);
    }
  };

  // Si no hay notificaciones o ya pasamos todas, no mostrar nada
  if (notificaciones.length === 0 || indiceActual >= notificaciones.length) {
    return null; 
  }

  const notificacionActual = notificaciones[indiceActual];
  
  // Transformar 'ACCEPT' o 'DECLINE' al formato del componente visual
  const statusAviso = notificacionActual.operacion === 'ACCEPT' ? 'accepted' : 'rejected';
  
  // Usar el campo 'asunto' del LOG para el nombre del documento
  const nombreDoc = notificacionActual.asunto || t('gestor.documento_default');

  return (
    <AvisoDocumento 
      isOpen={true} 
      onClose={manejarSiguiente} 
      documentName={nombreDoc} 
      status={statusAviso} 
    />
  );
};

export default GestorNotificaciones;