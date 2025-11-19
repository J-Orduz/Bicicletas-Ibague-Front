import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@contexts/AuthContext';

export const useFetch = (
  baseUrl = '',
  errorMessage = 'Hubo un error',
  supabaseURL = false
  // verifyAuth = true,
) => {
  // Estados que se muestran al usuario
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  //   const { isAuthenticated, authIsLoading } = useAuth();

  // useRef para mantener el valor actual de authIsLoading
  //   const authIsLoadingRef = useRef(authIsLoading);
  //   const isAuthenticatedRef = useRef(isAuthenticated);

  // Actualizar las referencias cuando cambien los valores
  //   useEffect(() => {
  //     authIsLoadingRef.current = authIsLoading;
  //     isAuthenticatedRef.current = isAuthenticated;
  //   }, [authIsLoading, isAuthenticated]);

  // No hace fetch hasta que se llame a fetchData directamente
  const fetchData = useCallback(
    async (newUrl = '') => {
      //   if (verifyAuth) {
      //     // Espera a que la autenticación se complete antes de hacer la petición
      //     await new Promise((resolve) => {
      //       const checkAuthStatus = () => {
      //         if (!authIsLoadingRef.current) resolve();
      //         // Esperar 50ms y volver a verificar
      //         else setTimeout(checkAuthStatus, 50);
      //       };
      //       checkAuthStatus();
      //     });

      //     if (!isAuthenticatedRef.current) {
      //       throw new Error('Usuario no autenticado');
      //     }
      //   }

      setLoading(true);
      setError(null);

      const finalUrl = supabaseURL
        ? `/functions/v1${newUrl || baseUrl}`
        : `/api${newUrl || baseUrl}`;
        
      try {
        const response = await fetch(finalUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        let result = {};
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        }

        if (!response.ok) {
          throw new Error(result.message || `HTTP error ${response.status}`);
        }
        return result;
      } catch (err) {
        setError('Ha ocurrido un error'); // usuario
        console.error(`${errorMessage}:: ${err}`); // desarrollador

        const errorMsgs = {
          errorFetchMsg: errorMessage,
          errorJsonMsg: err.message,
        };
        throw errorMsgs;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl]//, verifyAuth, isAuthenticated, authIsLoading]
  );

  return { fetchData, loading, error };
};
