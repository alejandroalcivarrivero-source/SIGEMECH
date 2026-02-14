import axios from 'axios';

// Configuración de Red Inteligente (Híbrida)
const NETWORK_CONFIG = {
  local: 'http://127.0.0.1:3002/api',
  tailscale: 'http://100.64.87.1:3002/api',
  timeout: 2000 // 2 segundos
};

let currentBaseURL = NETWORK_CONFIG.local;

const api = axios.create({
  baseURL: currentBaseURL,
  timeout: NETWORK_CONFIG.timeout
});

// Mecanismo de Detección de Red y Failover
const verificarConectividad = async () => {
  console.log(`%c[RED] Iniciando diagnóstico de red...`, 'color: #3498db; font-weight: bold;');
  
  try {
    // Intento 1: Red Local
    await axios.get(`${NETWORK_CONFIG.local}/health`, { timeout: 1000 });
    console.log(`%c[RED] Conexión establecida: RED LOCAL OFICINA (${NETWORK_CONFIG.local})`, 'color: #2ecc71; font-weight: bold;');
    return NETWORK_CONFIG.local;
  } catch (localError) {
    console.warn(`%c[RED] Fallo en Red Local: ${localError.message}. Intentando redundancia...`, 'color: #f39c12;');
    
    try {
      // Intento 2: Red Tailscale
      await axios.get(`${NETWORK_CONFIG.tailscale}/health`, { timeout: 1000 });
      console.log(`%c[RED] Conexión establecida: RED TAILSCALE CASA (${NETWORK_CONFIG.tailscale})`, 'color: #2ecc71; font-weight: bold;');
      return NETWORK_CONFIG.tailscale;
    } catch (tailscaleError) {
      console.error(`%c[RED] CRÍTICO: No hay visibilidad del backend en ninguna red.`, 'color: #e74c3c; font-weight: bold;');
      return NETWORK_CONFIG.local; // Fallback por defecto
    }
  }
};

// Ejecutar verificación inicial
verificarConectividad().then((url) => {
  api.defaults.baseURL = url;
  console.log(`%c[RED] Configuración aplicada: ${url}`, 'color: #9b59b6;');
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
  async (error) => {
    const originalRequest = error.config;

    // Si no hay respuesta del servidor (error de red o CORS) y no hemos reintentado aún
    if (!error.response && !originalRequest._retry) {
      console.error('[RED] Error de red o servidor no disponible:', error.message);
      
      // Intentar switch de red si falla la actual
      if (api.defaults.baseURL === NETWORK_CONFIG.local) {
         console.warn('[RED] Intentando conmutación a Tailscale...');
         api.defaults.baseURL = NETWORK_CONFIG.tailscale;
         originalRequest.baseURL = NETWORK_CONFIG.tailscale;
         originalRequest._retry = true;
         return api(originalRequest);
      }
      
      return Promise.reject(new Error('No se pudo conectar con el servidor. Verifique su conexión a la red SIGEMECH.'));
    }

    // Si hay respuesta pero es error
    if (error.response) {
      const { status, data } = error.response;
      const isLoginRequest = originalRequest.url &&
        (originalRequest.url.includes('/auth/login') ||
         originalRequest.url.endsWith('/login'));

      // Manejo de expiración de sesión (401) o falta de permisos (403)
      if ((status === 401 || status === 403) && !isLoginRequest) {
        console.warn('[SEGURIDAD] Sesión inválida o expirada. Procediendo a cierre de sesión...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }

      // Normalización de mensajes de error
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
