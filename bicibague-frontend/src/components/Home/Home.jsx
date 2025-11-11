// styles
import './Home.scss';
// components
import { MapView } from '@components/map/MapView';

export const Home = () => {
  return (
    <main className="home-container">
      <h1>Mapa</h1>
      <MapView />
    </main>
  );
}
