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

// Obtener Stripe publishable key GET
export const useGetStripePublishableKey = () => {
  return {
    get: useFetch(
      '/config/stripe-pk',
      'Error al obtener la clave de Stripe',
      false // backend URL
    ).fetchData,
  };
};

// Crear PaymentIntent POST
export const useCreatePaymentIntentMutation = () => {
  const post = useMutation();
  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/payments/create-payment-intent',
        data,
        'Error al crear el payment intent',
        false // backend URL
      ),
  };
};

// Validar tarjeta POST
export const useValidateCardMutation = () => {
  const post = useMutation();
  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/payments/validate-card',
        data,
        'Error al validar la tarjeta',
        false // backend URL
      ),
  };
};

// Confirmar pago con token POST
export const useConfirmPaymentWithTokenMutation = () => {
  const post = useMutation();
  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/payments/confirm-with-token',
        data,
        'Error al confirmar el pago',
        false // backend URL
      ),
  };
};
