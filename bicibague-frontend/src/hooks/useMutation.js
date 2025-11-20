import { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';

export const useMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

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
      ? `/functions/v1${endpoint}`
      : `/api${endpoint}`;

    try {
      const isFormData = body instanceof FormData;

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

      return result;
    } catch (err) {
      setError('Ha ocurrido un error'); // usuario
      console.error(`${errorMessage}:: ${err?.message || err}`); // desarrollador
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
