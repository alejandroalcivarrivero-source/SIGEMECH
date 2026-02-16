import React, { useEffect } from 'react';
import { CircleCheck, TriangleAlert, CircleX, Info, WifiOff } from 'lucide-react';
import api from '../api/axios';

/**
 * ModalFeedback - Componente centralizado para retroalimentación de usuario.
 * Identidad Visual: Azul (#1e3a8a) y Oro (#d4af37 / #b8860b).
 * 
 * @param {string} type - 'éxito', 'error', 'advertencia', 'info'
 * @param {string} title - Título del mensaje
 * @param {string} message - Cuerpo del mensaje
 * @param {function} onClose - Función para cerrar el modal
 * @param {function} onConfirm - Función opcional para acción de confirmación
 * @param {number} autoClose - Tiempo en ms para auto-cierre (solo éxito)
 */
const ModalFeedback = ({ type, title, message, onClose, onConfirm, autoClose = 0 }) => {
  useEffect(() => {
    // Escuchar tecla ENTER para cerrar o confirmar
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (onConfirm) {
          onConfirm();
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onConfirm]);

  useEffect(() => {
    const isSuccess = type === 'success' || type === 'éxito';
    if (autoClose > 0 && isSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, type]);

  const config = {
    éxito: {
      icon: <CircleCheck className="w-16 h-16 text-[#d4af37] mb-4" />,
      bg: 'bg-[#1e3a8a]',
      text: 'text-white',
      accent: 'text-[#d4af37]',
      button: 'bg-[#d4af37] hover:bg-[#b8860b] text-[#1e3a8a]'
    },
    error: {
      icon: <CircleX className="w-16 h-16 text-[#d4af37] mb-4" />,
      bg: 'bg-red-50',
      text: 'text-red-900',
      accent: 'text-red-700',
      button: 'bg-red-600 hover:bg-red-700 text-white'
    },
    advertencia: {
      icon: <TriangleAlert className="w-16 h-16 text-[#1e3a8a] mb-4" />,
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      accent: 'text-[#1e3a8a]',
      button: 'bg-[#1e3a8a] hover:bg-blue-900 text-white'
    },
    info: {
      icon: <Info className="w-16 h-16 text-[#d4af37] mb-4" />,
      bg: 'bg-[#1e3a8a]',
      text: 'text-white',
      accent: 'text-[#d4af37]',
      button: 'bg-[#d4af37] hover:bg-[#b8860b] text-[#1e3a8a]'
    }
  };

  // Normalizar tipo
  const tipoNormalizado = type === 'success' ? 'éxito' : (type === 'warning' ? 'advertencia' : type);
  const currentConfig = config[tipoNormalizado] || config.info;

    const isOffline = api.defaults.baseURL?.includes('127.0.0.1');
  
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
        <div className={`${currentConfig.bg} rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 w-full max-w-md flex flex-col items-center text-center transform transition-all scale-100 animate-in zoom-in-95 duration-300 border border-[#d4af37]/20 overflow-hidden`}>
          
          {isOffline && (
              <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-[#1e3a8a] to-[#b8860b] text-white text-xs font-bold p-1 text-center flex items-center justify-center shadow-lg">
                  <WifiOff className="w-4 h-4 mr-2" />
                  Modo Offline/Local Detectado
              </div>
          )}
  
          <div className="drop-shadow-lg mt-4">
            {currentConfig.icon}
          </div>
        
        <h3 className={`text-2xl font-bold mb-3 tracking-tight ${currentConfig.accent}`}>
          {title}
        </h3>
        
        <p className={`text-lg mb-8 leading-relaxed ${currentConfig.text} opacity-90`}>
          {message}
        </p>
        
        <div className="flex gap-4 w-full">
          <button
            onClick={onClose}
            className={`flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 ${currentConfig.text} font-semibold rounded-xl transition-all duration-200 border border-white/10 cursor-pointer`}
          >
            {onConfirm ? 'Cancelar' : 'Cerrar'}
          </button>
          
          {onConfirm && (
            <button
              onClick={onConfirm}
              className={`flex-1 py-3 px-6 ${currentConfig.button} font-bold rounded-xl transition-all duration-200 shadow-lg cursor-pointer`}
            >
              Confirmar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalFeedback;
