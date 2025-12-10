import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    // Cargar token del localStorage al iniciar
    const loadAuth = () => {
      try {
        const storedToken = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
          console.log('Token de autenticación cargado');

          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Error al cargar autenticación:', error);
        // Si hay error, limpiar todo
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    // procesar el token de verificación desde la URL (cuando el usuario hace clic en el enlace del email)
    const processURLToken = () => {
      const hash = window.location.hash;
      if (hash.includes('access_token')) {
        const params = {};

        hash
          .substring(1)
          .split('&')
          .forEach((param) => {
            const [key, value] = param.split('=');
            params[key] = decodeURIComponent(value);
          });

        if (params.access_token) {
          // Guardar token
          localStorage.setItem('access_token', params.access_token);

          console.log('Token de verificación guardado');

          // Limpiar la URL (remover el fragmento)
          window.history.replaceState(null, null, ' ');

          alert(t('auth.emailVerified'));
        }
      }
    };

    processURLToken();
    loadAuth();
  }, []);

  // Función para iniciar sesión
  const login = (accessToken, userData = null) => {
    try {
      localStorage.setItem('access_token', accessToken);
      setToken(accessToken);
      setIsAuthenticated(true);

      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      }
    } catch (error) {
      console.error('Error al guardar autenticación:', error);
      throw error;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Función para actualizar el usuario
  const updateUser = (userData) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  };

  // Función para verificar si el token sigue siendo válido
  const checkAuth = () => {
    const storedToken = localStorage.getItem('access_token');
    if (!storedToken) {
      logout();
      return false;
    }
    return true;
  };

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
