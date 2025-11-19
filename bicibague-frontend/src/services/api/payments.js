import { useFetch } from '@hooks/useFetch';
import { useMutation } from '@hooks/useMutation';

// Obtener saldo actual GET
export const useGetCurrentBalance = () => {
  return {
    get: useFetch(
      '/consultar-saldo',
      'Error al obtener el saldo actual',
      true // supabaseURL
    ).fetchData,
  };
};

// crear recarga POST
export const useCreateRechargeMutation = () => {
  const post = useMutation();
  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/crear-recarga',
        data,
        'Error al crear la recarga',
        true // supabaseURL
      ),
  };
};

// simular recarga POST
export const useSimulateRechargeMutation = () => {
  const post = useMutation();

  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/stripe-webhook',
        data,
        'Error al simular la recarga',
        true, // supabaseURL
        {
          headers: {
            'Stripe-Signature': 'whsec_8zWE5NdAtSLXUobRqJlIrlPtczyA7pbg',
          },
        } // header de stripe
      ),
  };
};
