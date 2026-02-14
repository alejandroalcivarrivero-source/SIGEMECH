import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ModalFeedback from '../components/ModalFeedback';
const Login = () => {
  const [cedula, setCedula] = useState('');
  const [clave, setClave] = useState('');
  const [modal, setModal] = useState({ show: false, type: 'info', title: '', message: '' });
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Llamamos a login() del AuthContext para actualizar el estado global
      const user = await login(cedula, clave);
      
      setModal({
        show: true,
        type: 'success',
        title: `¡Bienvenido ${user?.nombres || user?.firstName || 'Usuario'}!`,
        message: 'Credenciales verificadas. Accediendo al sistema...'
      });

      // Redirección automática tras delay de 1.5s
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (err) {
      console.error('Login error:', err);
            
            // Si el error es de red y estamos en modo fallback, permitir login local.
            const isNetworkError = err.message.toLowerCase().includes('network') || err.message.toLowerCase().includes('offline');
            
            if (isNetworkError) {
              setModal({
                show: true,
                type: 'informacion',
                title: 'Estás en Modo Offline',
                message: 'Intentando autenticación local. Algunas funciones pueden no estar disponibles.'
              });
              // Aquí podrías tener una lógica de autenticación local si la hubiera.
              // Por ahora, solo mostramos el mensaje. El interceptor ya maneja el fallback.
            }
      
            // Los errores ahora vienen normalizados por el interceptor blindado
            const errorMessage = err.message || 'Error inesperado al intentar iniciar sesión.';
            const errorTitle = err.status === 401 ? 'Acceso Denegado' : 'Error de Sistema';
      
      setModal({
        show: true,
        type: 'advertencia',
        title: errorTitle,
        message: errorMessage
      });
    }
  };

  const closeModal = () => {
    setModal({ ...modal, show: false });
    // Si el login fue exitoso, redirigir inmediatamente al cerrar el modal
    if (modal.type === 'success') {
      navigate('/dashboard');
    }
  };

  return (
    <div
      className="flex flex-col justify-center items-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/FOTO_CENTRO_SALUD_CHONE.jpg')" }}
    >
      {modal.show && (
        <ModalFeedback
          type={modal.type}
          title={modal.title}
          message={modal.message}
          onClose={closeModal}
          autoClose={modal.type === 'success' ? 1500 : false}
        />
      )}
      
      <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-xl p-8 w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/LOGO_MSP.png"
            alt="MSP Logo"
            className="h-20 mb-4 mix-blend-multiply contrast-125 brightness-110"
          />
          <h2 className="text-xl font-bold text-center text-gray-800 uppercase tracking-wide">
            Centro de Salud Chone Tipo C
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Número de Cédula
            </label>
            <input
              type="text"
              required
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ingrese su cédula"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              required
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Ingrese su contraseña"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            Ingresar al Sistema
          </button>
        </form>
        
        <div className="mt-6 text-center">
             <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium">
               ¿Olvidaste tu contraseña?
             </a>
        </div>
      </div>

      <footer className="mt-8 text-center text-white px-4">
        <p className="text-sm font-semibold drop-shadow-md">
          Sistema de Gestión de Emergencias - Centro de Salud Chone Tipo C
        </p>
        <p className="text-xs mt-1 opacity-90 drop-shadow-md">
          © 2026-Desarrollado por Sergio Solorzano y Alejandro Alcivar, con la colaboración de la Inteligencia Artificial de Google.
        </p>
      </footer>
    </div>
  );
};

export default Login;
