import { useFetch } from '@hooks/useFetch';
import { useMutation } from '@hooks/useMutation';

// Iniciar viaje POST
export const useStartTripMutation = () => {
  const post = useMutation();

  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/bikes/iniciar-viaje',
        data,
        'Numero de serie incorrecto'
      ),
  };
};

// Reservar bicicleta POST
export const useReserveBikeMutation = () => {
  const post = useMutation();

  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/bikes/reservar',
        data,
        'Error al reservar la bicicleta'
      ),
  };
};

// Obtener reserva actual (activa) GET
export const useGetCurrentReservation = () => {
  return {
    get: useFetch('/bikes/reservas/activa', 'Error al obtener la reserva actual')
      .fetchData,
  };
};
