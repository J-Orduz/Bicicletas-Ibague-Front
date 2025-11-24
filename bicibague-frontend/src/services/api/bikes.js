import { useFetch } from '@hooks/useFetch';
import { useMutation } from '@hooks/useMutation';

// Obtener estaciones GET
export const useGetStations = () => {
  return {
    get: useFetch('/bikes/estaciones', 'Error al obtener las estaciones')
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
