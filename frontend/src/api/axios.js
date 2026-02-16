import axios from 'axios';

const transformarAMayusculas = (objeto) => {
  if (Array.isArray(objeto)) {
    return objeto.map(item => transformarAMayusculas(item));
  } else if (objeto !== null && typeof objeto === 'object') {
    const nuevoObjeto = {};
    for (const llave in objeto) {
      if (Object.prototype.hasOwnProperty.call(objeto, llave)) {
        nuevoObjeto[llave] = transformarAMayusculas(objeto[llave]);
      }
    }
    return nuevoObjeto;
  } else if (typeof objeto === 'string') {
    return objeto.toUpperCase();
  }
  return objeto;
};

const api = axios.create({
  baseURL: 'http://localhost:3002/api',
  timeout: 10000,
});

export const initializeConnection = () => {
  console.log("Conexión inicializada con el backend en http://localhost:3002/api");
};

// Interceptor para asegurar que la URL base esté configurada antes de cada petición
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Soberanía de Datos: Normalización a MAYÚSCULAS
  if (config.data && !(config.data instanceof FormData)) {
    config.data = transformarAMayusculas(config.data);
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});


// Interceptor para manejar errores globales (Blindaje AIM)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isLoginRequest = originalRequest.url && (originalRequest.url.includes('/auth/login') || originalRequest.url.endsWith('/login'));

    if (!error.response && isLoginRequest) {
      console.error(`[RED] Fallo de red durante el login. No se reintentará.`, error.message);
      return Promise.reject(new Error('No se pudo conectar al servidor para iniciar sesión.'));
    }

    if (!error.response && !isLoginRequest) {
      console.error(`[RED] Fallo crítico de comunicación: ${error.message}`);
      return Promise.reject(new Error('Sistema SIGEMECH fuera de línea. Verifique su conexión.'));
    }

    if (error.response) {
      const { status, data } = error.response;
      
      if ((status === 401 || status === 403) && !isLoginRequest) {
        console.warn('[SEGURIDAD] Sesión inválida o expirada. Procediendo a cierre de sesión...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }

      const customError = {
        message: data?.message || 'Error no catalogado en el sistema.',
        status: status,
        originalError: error
      };
      return Promise.reject(customError);
    }

    return Promise.reject(error);
  }
);

export default api;
