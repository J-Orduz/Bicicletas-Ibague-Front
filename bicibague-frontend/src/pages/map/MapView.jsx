// leaftlet map. Tutorial: https://leafletjs.com/examples.html
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Fix para los iconos de Leaflet en Vite/React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// components
import { ReserveBike } from './ReserveBike.jsx';

// styles
import './MapView.scss';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export const MapView = () => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [showReserveModal, setShowReserveModal] = useState(false);

  // Coordenadas de Ibagué, Colombia
  const center = [4.4389, -75.2322];

  // Estaciones de bicicletas con coordenadas de ejemplo en Ibagué
  const bikeStations = [
    {
      id: 1,
      name: 'Estación Centro',
      position: [4.4389, -75.2322],
      bikes: [
        { id: 'M001', type: 'mechanical', available: true },
        { id: 'M002', type: 'mechanical', available: true },
        { id: 'M003', type: 'mechanical', available: false },
        { id: 'E001', type: 'electric', available: true },
        { id: 'E002', type: 'electric', available: true },
      ],
    },
    {
      id: 2,
      name: 'Estación Norte',
      position: [4.4489, -75.2222],
      bikes: [
        { id: 'M004', type: 'mechanical', available: true },
        { id: 'M005', type: 'mechanical', available: false },
        { id: 'E003', type: 'electric', available: false },
      ],
    },
    {
      id: 3,
      name: 'Estación Sur',
      position: [4.4289, -75.2422],
      bikes: [
        { id: 'M006', type: 'mechanical', available: true },
        { id: 'M007', type: 'mechanical', available: true },
        { id: 'M008', type: 'mechanical', available: true },
        { id: 'M009', type: 'mechanical', available: true },
        { id: 'E004', type: 'electric', available: true },
        { id: 'E005', type: 'electric', available: true },
        { id: 'E006', type: 'electric', available: true },
        { id: 'E007', type: 'electric', available: false },
      ],
    },
  ];

  const handleOpenReserve = (station) => {
    setSelectedStation(station);
    setShowReserveModal(true);
  };

  const handleCloseReserve = () => {
    setShowReserveModal(false);
    setSelectedStation(null);
  };

  return (
    <>
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
              <Popup maxWidth={350} className="custom-popup">
                <BikeStationPopup
                  name={station.name}
                  bikes={station.bikes}
                  onReserveClick={() => handleOpenReserve(station)}
                />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </section>

      {showReserveModal && selectedStation && (
        <ReserveBike station={selectedStation} onClose={handleCloseReserve} />
      )}
    </>
  );
};

export const BikeStationPopup = ({ name, bikes, onReserveClick }) => {
  const totalCapacity = 15;
  const availableBikes = bikes.filter((bike) => bike.available);

  return (
    <div className="bike-station-popup">
      <h3>{name}</h3>
      <div className="station-stats">
        <div className="stat-item">
          <span className="stat-label">Disponibles:</span>
          <span className="stat-value">
            {availableBikes.length} / {totalCapacity}
          </span>
        </div>
      </div>

      <button
        className="btn-reserve"
        onClick={onReserveClick}
        disabled={availableBikes.length === 0}
      >
        {availableBikes.length > 0
          ? 'Ver Bicicletas Disponibles'
          : 'No hay bicicletas disponibles'}
      </button>
    </div>
  );
};
