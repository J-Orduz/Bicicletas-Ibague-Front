import { useFetch } from '@hooks/useFetch';
import { useMutation } from '@hooks/useMutation';

// Obtener estaciones GET
export const useGetStations = () => {
  return {
    get: useFetch('/stations/getAll', 'Error al obtener las estaciones')
      .fetchData,
  };
};

// Obtener bicicletas de una estación GET
export const useGetStationBikes = (stationId) => {
  return {
    get: useFetch(``, 'Error al obtener las bicicletas de la estación')
      .fetchData,
  };
};

// Obtener todas las bicicletas GET
export const useGetAllBikes = () => {
  return {
    get: useFetch('/bikes', 'Error al obtener las bicicletas').fetchData,
  };
};

// Obtener telemetria de una bicicleta GET
export const useGetBikeTelemetry = () => {
  const { fetchData } = useFetch(
    ``,
    'Error al obtener la telemetría de la bicicleta'
  );
  return {
    get: (bikeId) => {
      return fetchData(`/bikes/${bikeId}/telemetria`);
    },
  };
};
