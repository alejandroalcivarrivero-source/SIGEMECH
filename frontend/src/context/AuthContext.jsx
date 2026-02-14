import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          // Bajo Soberanía Lingüística: Verificación de identidad/sesión activa
          // Intentamos validar con el backend para asegurar que el token sea vigente
          const response = await api.get('/auth/verificar-identidad');
          
          if (response.data && (response.data.user || response.data.usuario)) {
            const currentU = response.data.user || response.data.usuario;
            // Mapeo para normalización de datos del usuario
            const normalizedUser = {
              ...currentU,
              name: (currentU.firstName || currentU.nombres) + ' ' + (currentU.lastName || currentU.apellidos),
              role: currentU.role || 'usuario',
              roles: currentU.roles || [],
              permissions: currentU.permissions || []
            };

            // Misión 2: Sergio es el Master, acceso total
            if (normalizedUser.name.includes('Sergio')) {
              normalizedUser.permissions = ['*'];
              normalizedUser.roles = ['*'];
            }
            setUser(normalizedUser);
            setIsAuthenticated(true);
            // Actualizar localStorage con datos frescos si es necesario
            localStorage.setItem('user', JSON.stringify(normalizedUser));
          } else {
            throw new Error('Sesión inválida');
          }
        } catch (error) {
          console.error('Error verificando sesión:', error);
          // Limpieza forzosa ante fallo de validación
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    verificarSesion();
  }, []);

  const login = async (cedula, clave) => {
      try {
          const data = await authService.login(cedula, clave);
      const normalizedUser = {
        ...data.user,
        name: (data.user.firstName || data.user.nombres) + ' ' + (data.user.lastName || data.user.apellidos),
        role: data.user.role || 'usuario',
        roles: data.user.roles || [],
        permissions: data.user.permissions || []
      };

      // Misión 2: Sergio es el Master, acceso total
      if (normalizedUser.name.includes('Sergio')) {
        normalizedUser.permissions = ['*'];
        normalizedUser.roles = ['*'];
      }
      setUser(normalizedUser);
      setIsAuthenticated(true);
      return normalizedUser;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
