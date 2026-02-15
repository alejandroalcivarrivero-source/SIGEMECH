import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../api/authService';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función auxiliar para normalizar usuario
  const normalizarUsuario = (userData) => {
    if (!userData) return null;

    // Prioridad a nombres/apellidos que vienen del backend
    const nombre = userData.nombres || userData.firstName || userData.nombre || 'Usuario';
    const apellido = userData.apellidos || userData.lastName || userData.apellido || '';
    
    // Construcción robusta del nombre completo para mostrar en Header
    const nombreCompleto = (nombre && apellido)
        ? `${nombre} ${apellido}`
        : (nombre || apellido || 'Usuario del Sistema');

    return {
        ...userData,
        id: userData.id,
        username: userData.username || userData.cedula, // Fallback a cedula si username no existe
        nombres: nombre,
        apellidos: apellido,
        name: nombreCompleto.trim(), // Unificado para frontend (Header usa .name)
        role: userData.role || 'usuario',
        roles: Array.isArray(userData.roles) ? userData.roles : (userData.role ? [userData.role] : []),
    };
};

  useEffect(() => {
    const verificarSesion = async () => {
      const token = localStorage.getItem('token');
      // Intentar recuperar usuario del localStorage primero para UX inmediata
      const savedUserStr = localStorage.getItem('user');
      let savedUser = null;
      
      if (savedUserStr) {
          try {
              savedUser = JSON.parse(savedUserStr);
              if (savedUser) {
                  setUser(normalizarUsuario(savedUser));
                  setIsAuthenticated(true);
              }
          } catch (e) {
              console.error("Error parseando usuario de localStorage", e);
          }
      }

      if (token) {
        try {
          // Bajo Soberanía Lingüística: Verificación de identidad/sesión activa
          // Intentamos validar con el backend para asegurar que el token sea vigente
          // NOTA: Si el backend no tiene este endpoint, fallará y deslogueará. 
          // Asumiremos que si hay token y user en local, es válido inicialmente, y validamos en background.
          
          /* 
             COMENTADO TEMPORALMENTE: Si el endpoint /auth/verificar-identidad no existe o falla, 
             no deberíamos matar la sesión local inmediatamente si ya tenemos datos.
             Mejor estrategia: Intentar renovar o verificar silenciosamente.
          */

          // const response = await api.get('/auth/verificar-identidad');
          // if (response.data && (response.data.user || response.data.usuario)) {
          //   const currentU = response.data.user || response.data.usuario;
          //   const normalized = normalizarUsuario(currentU);
          //   setUser(normalized);
          //   setIsAuthenticated(true);
          //   localStorage.setItem('user', JSON.stringify(normalized));
          // } 
          
          // Por ahora confiamos en el localStorage si existe token, 
          // las peticiones fallarán con 401 si el token expiró y el interceptor de axios (si existe) manejará el logout.
          if (!savedUser) {
             // Si hay token pero no usuario en local, ahí sí forzamos logout o fetch profile
             // authService.logout(); // O intentar fetch profile
          }

        } catch (error) {
          console.error('Error verificando sesión:', error);
          // authService.logout();
          // setUser(null);
          // setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    verificarSesion();
  }, []);

  const login = async (cedula, clave) => {
      try {
          const data = await authService.login(cedula, clave);
          
          // La respuesta del backend (auth_controller.js) es:
          // { mensaje, ficha_acceso, usuario: { id, nombres, apellidos } }
          
          if (data.ficha_acceso) {
              localStorage.setItem('token', data.ficha_acceso);
              // Configurar header por defecto para axios si es necesario, 
              // aunque usualmente se hace en el interceptor leyendo localStorage
          }

          const usuarioBackend = data.usuario || data.user;
          const normalizedUser = normalizarUsuario(usuarioBackend);

          // Misión 2: Sergio es el Master, acceso total (Hardcoded logic preserve)
          if (normalizedUser.name && normalizedUser.name.includes('Sergio')) {
            normalizedUser.permissions = ['*'];
            normalizedUser.roles = ['*'];
          }
          
          setUser(normalizedUser);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
          
          return normalizedUser;
      } catch (error) {
          throw error;
      }
  };

  const logout = () => {
    authService.logout(); // Limpia localStorage
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
