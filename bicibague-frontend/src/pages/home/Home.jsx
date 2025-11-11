// components
import { MapView } from '@pages/map/MapView';
import { SubHeader } from '@layouts/SubHeader';
// styles
import './Home.scss';

export const Home = () => {
  // procesar el token de verificación desde la URL (cuando el usuario hace clic en el enlace del email)
  const procesarTokenDeURL = () => {
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = {};

      hash
        .substring(1)
        .split('&')
        .forEach((param) => {
          const [key, value] = param.split('=');
          params[key] = decodeURIComponent(value);
        });

      if (params.access_token) {
        // Guardar token
        localStorage.setItem('access_token', params.access_token);
        localStorage.setItem('refresh_token', params.refresh_token);
        localStorage.setItem('token_expires_at', params.expires_at);

        console.log('✅ Token de verificación guardado');

        // Limpiar la URL (remover el fragmento)
        window.history.replaceState(null, null, ' ');

        // Mostrar mensaje de éxito
        alert('✅ Email verificado exitosamente. Ahora puedes iniciar sesión.');
      }
    }
  };

  procesarTokenDeURL();

  return (
    <section className="home-container">
      <SubHeader pageTitle="Mapa BicIbagué" />
      <MapView />
    </section>
  );
};
