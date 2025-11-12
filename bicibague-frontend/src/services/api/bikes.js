import { useFetch } from '@hooks/useFetch';
import { useMutation } from '@hooks/useMutation';

// ESTACION GET
export const useGetStations = () => {
  return {
    get: useFetch('/bikes/estaciones', 'Error al obtener las estaciones')
      .fetchData,
  };
};

// BICICLETAS EN ESTACION GET
export const useGetStationBikes = (stationId) => {
  return {
    get: useFetch(``, 'Error al obtener las bicicletas de la estación')
      .fetchData,
  };
};

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
