import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3002/api'
});

// Interceptor para añadir el token a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor para manejar errores globales (Blindaje AIM)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si no hay respuesta del servidor (error de red o CORS)
    if (!error.response) {
      console.error('Error de red o servidor no disponible:', error.message);
      return Promise.reject(new Error('No se pudo conectar con el servidor. Verifique su conexión.'));
    }

    const { status, data } = error.response;
    const isLoginRequest = error.config && error.config.url &&
      (error.config.url.includes('/auth/login') ||
       error.config.url.endsWith('/login'));

    // Manejo de expiración de sesión (401) o falta de permisos (403)
    if ((status === 401 || status === 403) && !isLoginRequest) {
      console.warn('Sesión inválida o expirada. Redirigiendo a login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Evitar bucles de redirección si ya estamos en el login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }

    // Normalización de mensajes de error para la UI
    const customError = {
      message: data?.message || 'Ha ocurrido un error inesperado.',
      status: status,
      originalError: error
    };

    return Promise.reject(customError);
  }
);

export default api;
