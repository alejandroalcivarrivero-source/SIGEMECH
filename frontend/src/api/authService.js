import api from './axios';

const authService = {
  /**
   * Realiza la petición de login y procesa la respuesta.
   * @param {string} cedula 
   * @param {string} password 
   * @returns {Promise<Object>} Datos del usuario y token
   */
  login: async (cedula, password) => {
    try {
      const response = await api.post('/auth/login', { cedula, password });

      if (!response || !response.data) {
        throw new Error('Error de conexión con el servidor.');
      }

      if (!response.data.token) {
        throw new Error('Error de Servidor: Autenticación fallida.');
      }

      const token = response.data.token;
      const userData = response.data.user || response.data.usuario;

      if (!userData) {
        throw new Error('Error de Servidor: No se recibieron datos del usuario.');
      }

      // Almacenamiento local
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      return { user: userData, token };
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
