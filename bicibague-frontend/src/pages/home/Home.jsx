// components
import { MapView } from '@pages/map/MapView';
import { SubHeader } from '@layouts/SubHeader';
// styles
import './Home.scss';

export const Home = () => {
  return (
    <section className="home-container">
      <SubHeader pageTitle="Mapa BicIbagué" />
      <MapView />
    </section>
  );
};
