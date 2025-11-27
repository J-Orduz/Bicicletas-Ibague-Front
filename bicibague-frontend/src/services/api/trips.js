import { useFetch } from '@hooks/useFetch';
import { useMutation } from '@hooks/useMutation';

// Obtener viaje actual GET
export const useGetCurrentTrip = () => {
  return {
    get: useFetch('/booking/viajes/activo', 'Error al obtener el viaje actual')
      .fetchData,
  };
};

// Obtener historial de viajes GET
export const useGetTripHistory = () => {
  return {
    get: useFetch(
      '/booking/viajes/historial',
      'Error al obtener el historial de viajes'
    ).fetchData,
  };
};

// Finalizar viaje POST
export const useEndTripMutation = () => {
  const post = useMutation();

  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/trips/finalizar',
        data,
        'Error al finalizar el viaje'
      ),
  };
};