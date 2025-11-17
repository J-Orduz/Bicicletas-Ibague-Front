import { useFetch } from '@hooks/useFetch';
import { useMutation } from '@hooks/useMutation';

// Obtener reserva actual (activa) GET
export const useGetCurrentReservation = () => {
  return {
    get: useFetch(
      '/booking/reservas/activa',
      'Error al obtener la reserva actual'
    ).fetchData,
  };
};

// Obtener historial de reservas GET
export const useGetReservationHistory = () => {
  return {
    get: useFetch(
      '/booking/reservas/usuario',
      'Error al obtener el historial de reservas'
    ).fetchData,
  };
};

// Iniciar viaje POST
export const useStartTripMutation = () => {
  const post = useMutation();

  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/booking/iniciar-viaje',
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
        '/booking/reservar',
        data,
        'Error al reservar la bicicleta'
      ),
  };
};

// Cancelar reserva POST
export const useCancelReservationMutation = () => {
  const post = useMutation();
  
  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/booking/cancelar-reserva',
        data,
        'Error al cancelar la reserva'
      ),
  };
};
