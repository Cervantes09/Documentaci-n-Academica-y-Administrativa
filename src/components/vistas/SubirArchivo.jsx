import React, { useState, useEffect } from 'react';
import { HiOutlineCloudUpload, HiOutlineX, HiOutlineDocumentText } from "react-icons/hi";
import { supabase } from '../../lib/supabase';
import { useSession } from '../../context/dataSesionUsuario';

// Agregamos userRole a las propiedades que recibe el componente
const SubirArchivo = ({ isOpen, onClose, onUploadSuccess, userRole }) => {
  // Obtenemos los datos del usuario logueado del contexto
  const { sesion, datosUsuario } = useSession();

  const [archivo, setArchivo] = useState(null);
  const [nombre, setNombre] = useState(""); 
  const [periodo, setPeriodo] = useState("");
  const [tipo, setTipo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const periodos = ["ENE-ABR 2026", "MAY-AGO 2026", "SEP-DIC 2026"];
  const tiposDocumentos = ["Planeación Docente", "Lista de Asistencia", "Acta de Academia", "Reporte Final"];

  useEffect(() => {
    if (archivo && !nombre) {
      const nombreSinExtension = archivo.name.split('.').slice(0, -1).join('.');
      setNombre(nombreSinExtension);
    }
  }, [archivo]);

  if (!isOpen) return null;

  const handleFormulario = async (e) => {
    e.preventDefault();
    
    if (!archivo) {
      alert("Por favor selecciona un archivo.");
      return;
    }

    if (!nombre.trim()) {
      alert("Por favor ponle un nombre al documento.");
      return;
    }

    // Seguridad: Verificar que tengamos al usuario antes de intentar subir
    if (!sesion) {
      alert("No se detectó una sesión activa. Por favor, reingresa al sistema.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Crear nombre único para el Storage
      const fileExt = archivo.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `documentos_subidos/${fileName}`;

      // 2. Subir al Bucket
      const { error: storageError } = await supabase.storage
        .from('documentos')
        .upload(filePath, archivo);

      if (storageError) throw storageError;

      // 3. Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(filePath);
      
      const archivoUrl = publicUrlData.publicUrl;

      // 4. Guardar en BD incluyendo la Foreign Key del usuario
      const { error: dbError } = await supabase
        .from('DOCUMENTO')
        .insert([
          { 
            nombre: nombre,
            tipo: tipo, 
            clasificacion: periodo, 
            archivo: archivoUrl, 
            // AQUÍ ESTÁ LA MAGIA: Condicionamos el estado según el rol
            estado: (userRole === 'administrativo' || userRole === 'director') ? 'Validado' : 'Pendiente',
            fecha: new Date().toISOString(),
            // Usamos el ID de tu tabla usuario o el UID de Auth
            usuarioFK: datosUsuario?.usuarioid || sesion.id 
          }
        ]);

      if (dbError) throw dbError;

      alert("¡Archivo subido correctamente!");
      
      setArchivo(null);
      setNombre("");
      setPeriodo("");
      setTipo("");
      
      if (onUploadSuccess) onUploadSuccess();
      onClose(); 

    } catch (error) {
      console.error("Error completo:", error);
      alert("Hubo un error al subir: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cerrarModal = () => {
    setArchivo(null);
    setNombre("");
    setPeriodo("");
    setTipo("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden relative border border-slate-100">
        
        <button 
          onClick={cerrarModal} 
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-emerald-600 transition-colors disabled:opacity-50"
        >
          <HiOutlineX size={20} />
        </button>

        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineCloudUpload className="text-emerald-600" size={24}/>
            Subir Nuevo Documento
          </h2>
        </div>

        <form onSubmit={handleFormulario} className="p-6 space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-600">Nombre del Documento:</label>
            <input 
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Planeación IDGS81"
              required
              disabled={isSubmitting}
              className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-600">Periodo:</label>
              <select 
                value={periodo} 
                onChange={(e) => setPeriodo(e.target.value)} 
                required
                disabled={isSubmitting}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100"
              >
                <option value="" disabled>Seleccionar...</option>
                {periodos.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-600">Tipo:</label>
              <select 
                value={tipo} 
                onChange={(e) => setTipo(e.target.value)} 
                required
                disabled={isSubmitting}
                className="w-full p-2.5 border border-slate-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none disabled:bg-slate-100"
              >
                <option value="" disabled>Seleccionar...</option>
                {tiposDocumentos.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <label className="text-sm font-semibold text-slate-600">Archivo (PDF/Word):</label>
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${archivo ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-50'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input 
                type="file" 
                onChange={(e) => setArchivo(e.target.files[0])} 
                className="sr-only"
                id="file-input"
                accept=".pdf,.doc,.docx"
                required
                disabled={isSubmitting}
              />
              <label htmlFor="file-input" className={`flex flex-col items-center gap-2 ${isSubmitting ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                {archivo ? (
                  <>
                    <HiOutlineDocumentText size={32} className="text-emerald-600" />
                    <p className="text-sm font-bold text-slate-700">{archivo.name}</p>
                  </>
                ) : (
                  <>
                    <HiOutlineCloudUpload size={32} className="text-slate-400" />
                    <p className="text-sm font-medium text-slate-600">Click para seleccionar archivo</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button type="button" onClick={cerrarModal} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-slate-600 rounded-lg border hover:bg-slate-50 transition-all">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-all shadow-md">{isSubmitting ? 'Subiendo...' : 'Subir Archivo'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubirArchivo;