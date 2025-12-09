import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@contexts/AuthContext';

const apiBase = import.meta.env.VITE_API_BASE || '';

// Ref global compartida entre todas las instancias del hook (si sirvio OMG :v)
let globalAlertShown = false;

export const useFetch = (
  baseUrl = '',
  errorMessage = 'Hubo un error',
  supabaseURL = false
  // verifyAuth = true,
) => {
  // Estados que se muestran al usuario
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();

  // No hace fetch hasta que se llame a fetchData directamente
  const fetchData = useCallback(
    async (newUrl = '') => {
      setLoading(true);
      setError(null);

      const finalUrl = supabaseURL
        ? `/functions/v1${newUrl || baseUrl}`
        : `${apiBase}/api${newUrl || baseUrl}`;

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
          const errorMsgs = {
            message: result.message || `HTTP error ${response.status}`,
            status: response.status, // en caso de manejar errores segun el codigo de estado
          };
          throw errorMsgs;
        }
        globalAlertShown = false;
        return result;
      } catch (err) {
        setError('Ha ocurrido un error'); // usuario
        console.error(`${errorMessage}:: ${err.message}`); // desarrollador

        // Si el error es 401 (Unauthorized), cerrar sesión
        if (err.status === 401 && !globalAlertShown) {
          globalAlertShown = true;
          logout();
          alert('Sesión expirada. Por favor, inicia sesión de nuevo.');
        }

        const errorMsgs = {
          errorFetchMsg: errorMessage,
          errorJsonMsg: err.message,
        };
        throw errorMsgs;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, errorMessage, token, logout] //, verifyAuth, isAuthenticated, authIsLoading]
  );

  return { fetchData, loading, error };
};
