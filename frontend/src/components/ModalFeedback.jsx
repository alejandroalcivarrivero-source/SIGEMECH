import React, { useEffect } from 'react';
import { CircleCheck, TriangleAlert, CircleX, Info } from 'lucide-react';

const ModalFeedback = ({ type, title, message, onClose, onConfirm, autoClose = 0 }) => {
  useEffect(() => {
    // Solo auto-cerrar si es éxito y autoClose es mayor a 0.
    // Los errores (error, warning) deben ser persistentes.
    const isSuccess = type === 'success' || type === 'éxito';
    
    if (autoClose > 0 && isSuccess) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, type]);

  const getIcon = () => {
    switch (type) {
      case 'success':
      case 'éxito':
        return <CircleCheck className="w-12 h-12 text-green-500 mb-4" />;
      case 'error':
        return <CircleX className="w-12 h-12 text-red-500 mb-4" />;
      case 'warning':
      case 'advertencia':
        return <TriangleAlert className="w-12 h-12 text-yellow-500 mb-4" />;
      default:
        return <Info className="w-12 h-12 text-blue-500 mb-4" />;
    }
  };

  const getTitleColor = () => {
    switch (type) {
        case 'success':
        case 'éxito':
          return 'text-green-700';
        case 'error':
          return 'text-red-700';
        case 'warning':
        case 'advertencia':
          return 'text-yellow-700';
        default:
          return 'text-blue-700';
      }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm flex flex-col items-center text-center transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        {getIcon()}
        
        <h3 className={`text-xl font-bold mb-2 ${getTitleColor()}`}>
          {title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className={`flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors cursor-pointer`}
          >
            {onConfirm ? 'Cancelar' : 'Cerrar'}
          </button>
          
          {onConfirm && (
            <button
              onClick={onConfirm}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer"
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
