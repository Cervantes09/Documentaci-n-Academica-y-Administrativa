// src/lib/logger.js
import { supabase } from './supabase';

// Mapeo de operaciones a verbos en participio
const verbos = {
  'INSERT': 'creado',
  'UPDATE': 'modificado',
  'DELETE': 'eliminado',
  'ACCEPT': 'aceptado',
  'DECLINE': 'declinado'
};

/**
 * @param {string} idActor - ID del que realiza la acción (usuario logueado)
 * @param {string} nombreActor - Nombre del que realiza la acción
 * @param {number} idDoc - ID del documento afectado
 * @param {string} nombreDoc - Nombre/Título del documento
 * @param {string} operacion - 'INSERT', 'UPDATE', etc.
 * @param {object} dueno - (Opcional) { id, nombre } del dueño del documento
 */
export const registrarLog = async (idActor, nombreActor, idDoc, nombreDoc, operacion, dueno = null) => {
  try {
    const participio = verbos[operacion] || operacion.toLowerCase();
    let asuntoConstruido = "";

    // Lógica de estructura de asunto según tu propuesta
    if (dueno && dueno.id !== idActor) {
      // Estructura para Administrativos/Directores actuando sobre otros
      asuntoConstruido = `'${nombreDoc}' de '${dueno.nombre}' ha sido '${participio}' por '${nombreActor}'`;
    } else {
      // Estructura para docentes o admins actuando sobre sus propios archivos
      asuntoConstruido = `'${nombreDoc}' ha sido '${participio}' por '${nombreActor}'`;
    }

    const { error } = await supabase
      .from('LOGS')
      .insert([
        {
          usuarioFK: idActor,
          documentoFK: idDoc,
          operacion: operacion,
          asunto: asuntoConstruido,
          // <-- NUEVO: Guardamos el ID del dueño. Si no se pasa 'dueno', asumimos que el actor es el dueño.
          propietarioDoc: dueno ? dueno.id : idActor 
        }
      ]);

    if (error) throw error;
  } catch (error) {
    console.error('Error al registrar log:', error.message);
  }
};