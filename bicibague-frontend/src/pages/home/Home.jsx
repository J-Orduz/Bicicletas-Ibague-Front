// components
import { MapView } from '@pages/map/MapView';
// styles
import './Home.scss';
import { SubHeader } from '@layouts/SubHeader';

export const Home = () => {
  return (
    <section className="home-container">
      <SubHeader pageTitle="Mapa BicIbagué" />
      <MapView />
    </section>
  );
};
