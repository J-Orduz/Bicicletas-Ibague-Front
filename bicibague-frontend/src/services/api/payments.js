import { useFetch } from '@hooks/useFetch';
import { useMutation } from '@hooks/useMutation';

// ------------ RECHARGE -------------- //
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

// Pagar con Saldo POST
export const usePayWithBalanceMutation = () => {
  const post = useMutation();
  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/pagar-con-saldo',
        data,
        'Error al pagar con saldo',
        true // supabaseURL
      ),
  };
}

// ------------ PAYMENT -------------- //
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
// export const useValidateCardMutation = () => {
//   const post = useMutation();
//   return {
//     post: (data) =>
//       post.mutate(
//         'POST',
//         '/payments/validate-card',
//         data,
//         'Error al validar la tarjeta',
//         false // backend URL
//       ),
//   };
// };

// Confirmar pago con token POST
// export const useConfirmPaymentWithTokenMutation = () => {
//   const post = useMutation();
//   return {
//     post: (data) =>
//       post.mutate(
//         'POST',
//         '/payments/confirm-with-token',
//         data,
//         'Error al confirmar el pago',
//         false // backend URL
//       ),
//   };
// };

// ------------ SUBSCRIPTION -------------- //
// Obtener suscripcion GET
export const useGetSubscription = () => {
  return {
    get: useFetch(
      '/consultar-suscripcion',
      'Error al obtener la suscripción',
      true // supabaseURL
    ).fetchData,
  };
};

// Crear suscripcion POST
export const useCreateSubscriptionMutation = () => {
  const post = useMutation();
  return {
    post: () =>
      post.mutate(
        'POST',
        '/crear-suscripcion',
        {},
        'Error al crear la suscripción',
        true // supabaseURL
      ),
  };
};

// Cancelar suscripcion POST
export const useCancelSubscriptionMutation = () => {
  const post = useMutation();
  return {
    post: () =>
      post.mutate(
        'POST',
        '/cancelar-suscripcion',
        {},
        'Error al cancelar la suscripción',
        true // supabaseURL
      ),
  };
};

// // ------------ CITYPASS -------------- //

// Obtener saldo citypass GET
export const useGetCityPassBalance = () => {
  return {
    get: useFetch('/citypass/saldo', 'Error al obtener el saldo de CityPass')
      .fetchData,
  };
};

// Vincular numero de citypass POST
export const useLinkCityPassMutation = () => {
  const post = useMutation();
  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/citypass/vincular',
        data,
        'Error al vincular CityPass'
      ),
  };
};

// Pagar con citypass POST
export const usePayWithCityPassMutation = () => {
  const post = useMutation();
  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/citypass/pago',
        data,
        'Error al pagar con CityPass'
      ),
  };
};
