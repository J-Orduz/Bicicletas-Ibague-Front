// leaftlet map. Tutorial: https://leafletjs.com/examples.html
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Fix para los iconos de Leaflet en Vite/React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// styles
import './MapView.scss';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export const MapView = () => {
  // Coordenadas de Ibagué, Colombia
  const center = [4.4389, -75.2322];

  // Estaciones de bicicletas con coordenadas de ejemplo en Ibagué
  const bikeStations = [
    { id: 1, name: 'Estación Centro', position: [4.4389, -75.2322], bikes: 5 },
    { id: 2, name: 'Estación Norte', position: [4.4489, -75.2222], bikes: 3 },
    { id: 3, name: 'Estación Sur', position: [4.4289, -75.2422], bikes: 8 },
  ];

  return (
    <section className="map-container">
      <MapContainer
        center={center}
        zoom={13}
        className="leaflet-map"
        scrollWheelZoom={true}
      >
        {/* pagina de estilos: https://leaflet-extras.github.io/leaflet-providers/preview/ */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tiles.stadiamaps.com/tiles/osm_bright/{z}/{x}/{y}{r}.png"
        />

        {bikeStations.map((station) => (
          <Marker key={station.id} position={station.position}>
            <Popup>
              <BikeStationPopup name={station.name} bikes={station.bikes} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </section>
  );
};

export const BikeStationPopup = ({ name, bikes }) => {
  return (
    <div className="bike-station-popup">
      <h3>{name}</h3>
      <p>
        Bicicletas disponibles: <strong>{bikes}</strong>
      </p>
    </div>
  );
};
