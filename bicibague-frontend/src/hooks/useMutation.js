import { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const apiBase = import.meta.env.VITE_API_BASE || '';
const supabaseURLenv = import.meta.env.VITE_SUPABASE_URL || '';

let globalAlertShown = false;

export const useMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, logout } = useAuth();
  const { t } = useTranslation();

  const mutate = async (
    method,
    endpoint,
    body = null,
    errorMessage = 'Hubo un error',
    supabaseURL = false,
    options = {}
    // verifyAuth = true
  ) => {
    // if (verifyAuth && !isAuthenticated) {
    //   throw new Error('Usuario no autenticado');
    // }

    setLoading(true);
    setError(null);

    // const finalUrl = `/v1${endpoint}`;
    const finalUrl = supabaseURL
      ? `${supabaseURLenv}/functions/v1${endpoint}`
      : `${apiBase}/api${endpoint}`;

    try {
      const isFormData = body instanceof FormData;
      const expectBlob = options?.responseType === 'blob';

      const response = await fetch(finalUrl, {
        method,
        headers: {
          ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options?.headers,
        },
        body: body ? (isFormData ? body : JSON.stringify(body)) : null,
      });

      let result = {};
      
      // Si se espera un blob (archivo), manejarlo directamente
      if (expectBlob) {
        if (!response.ok) {
          // Intentar leer el error como JSON si es posible
          const contentType = response.headers.get('Content-Type');
          if (contentType && contentType.includes('application/json')) {
            result = await response.json();
          }
          const errorMsgs = {
            message: result.message || `HTTP error ${response.status}`,
            status: response.status,
          };
          throw errorMsgs;
        }
        
        const blob = await response.blob();
        globalAlertShown = false;
        return { data: blob };
      }
      
      // Manejo normal para JSON
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      }

      if (!response.ok) {
        // throw new Error(result.message || `HTTP error ${response.status}`);
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
      console.error(`${errorMessage}:: ${err?.message || err}`); // desarrollador

      // Si el error es 401 (Unauthorized), cerrar sesión
      if (err.status === 401 && !globalAlertShown) {
        globalAlertShown = true;
        logout();
        alert(t('fetch.sessionExpired'));
      }

      const errorMsgs = {
        errorStatus: err?.status || 500,
        errorMutationMsg: errorMessage, // para usuario
        errorJsonMsg: err?.message || 'Error desconocido', // especifico del backend
      };

      throw errorMsgs;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
};
