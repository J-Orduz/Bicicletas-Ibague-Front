import { useMutation } from '@hooks/useMutation';

// Obtener reporte POST (maneja descarga de archivos)
export const useGenerateReportMutation = () => {
  const post = useMutation();

  return {
    post: (data) =>
      post.mutate(
        'POST',
        '/reports',
        data,
        'Error al obtener el reporte',
        false,
        { responseType: 'blob' }
      ),
  };
};
