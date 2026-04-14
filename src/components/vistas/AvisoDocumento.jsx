import React from 'react';
import { useTranslation } from 'react-i18next'; // 🔥 Importamos el traductor

const AvisoDocumento = ({ isOpen, onClose, documentName, status }) => {
  // 🔥 Inicializamos el traductor
  const { t } = useTranslation();

  // Si isOpen es false, no renderizamos nada (el modal se oculta)
  if (!isOpen) return null;

  // Verificamos el estado para cambiar estilos y textos
  const isAccepted = status === 'accepted';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Contenedor del recuadro central */}
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-11/12 max-w-md text-center transform transition-all animate-fade-in-up">
        
        {/* Ícono Superior (Check verde o X roja) */}
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${isAccepted ? 'bg-green-100' : 'bg-red-100'}`}>
          {isAccepted ? (
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        {/* Título */}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {isAccepted ? t('avisoDocumento.aceptado_titulo') : t('avisoDocumento.rechazado_titulo')}
        </h3>

        {/* Texto del aviso dinámico */}
        <p className="text-gray-600 mb-8 text-lg">
          {/* Imprimimos el string exacto que viene del LOG de Supabase */}
          <span className="font-semibold text-gray-900">{documentName}</span>
          
          {/* Si es rechazado, agregamos el texto de ayuda en un bloque nuevo abajo */}
          {!isAccepted && (
            <span className="block mt-4 text-sm text-gray-500">
              {t('avisoDocumento.duda_admin')}
            </span>
          )}
        </p>

        {/* Botón Siguiente */}
        <button
          onClick={onClose}
          className={`w-full py-3 px-4 rounded-xl text-white font-bold text-lg transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            isAccepted 
              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-green-500/30 shadow-lg' 
              : 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-500/30 shadow-lg'
          }`}
        >
          {t('avisoDocumento.siguiente')}
        </button>
      </div>
    </div>
  );
};

export default AvisoDocumento;