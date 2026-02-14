import api from './axios';

const authService = {
  /**
   * Realiza la petición de login y procesa la respuesta.
   * @param {string} cedula 
   * @param {string} password 
   * @returns {Promise<Object>} Datos del usuario y token
   */
  login: async (cedula, clave) => {
      try {
          const response = await api.post('/auth/login', { cedula, clave });

      if (!response || !response.data) {
        throw new Error('Error de conexión con el servidor.');
      }

      if (!response.data.ficha_acceso) {
          throw new Error('Error de Servidor: Autenticación fallida.');
      }

      const ficha_acceso = response.data.ficha_acceso;
      const userData = response.data.user || response.data.usuario;

      if (!userData) {
        throw new Error('Error de Servidor: No se recibieron datos del usuario.');
      }

      // Almacenamiento local
      localStorage.setItem('token', ficha_acceso);
      localStorage.setItem('user', JSON.stringify(userData));

      return { user: userData, token: ficha_acceso };
    } catch (error) {
      // Limpieza preventiva
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  },

  /**
   * Cierra la sesión del usuario.
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Obtiene el usuario actual desde el almacenamiento local.
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
