
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

// Obtener estadisticas de reservas GET
export const useGetReservationStats = () => {
  return {
    get: useFetch(
      '/booking/estadisticas',
      'Error al obtener las estadísticas de reservas'
    ).fetchData,
  };
}

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

// Reservar bicicleta con fecha y hora programada POST
export const useReserveBikeScheduledMutation = () => {
  const post = useMutation();
  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/booking/reservar-programada',
        data,
        'Error al reservar la bicicleta de forma programada'
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
