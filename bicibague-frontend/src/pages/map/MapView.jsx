// leaftlet map. Tutorial: https://leafletjs.com/examples.html
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Fix para los iconos de Leaflet en Vite/React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// components
import { ReserveBike } from './ReserveBike.jsx';
// api
import { useGetStations, useGetStationBikes } from '@api/bikes';

// styles
import './MapView.scss';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export const MapView = ({ onStationsLoaded }) => {
  const [selectedStation, setSelectedStation] = useState(null);
  const [showReserveModal, setShowReserveModal] = useState(false);

  // Coordenadas de Ibagué, Colombia
  const center = [4.4389, -75.2322];

  // --- Obtener estaciones y bicicletas ---
  const [bikeStations, setBikeStations] = useState([]);

  const getStations = useGetStations();
  const getStationBikes = useGetStationBikes();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stationsData = await getStations.get();

        // formatear datos de la estacion para el mapa
        const formattedStations = stationsData.map((station) => ({
          id: station.id,
          name: station.nombre,
          position: [station.posicion.latitud, station.posicion.longitud],
          bikes: [],
        }));

        setBikeStations(formattedStations);

        // Notificar al componente padre
        if (onStationsLoaded) {
          onStationsLoaded(formattedStations);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchStations();
  }, []);

  // funcion para obtner las bicicletas de una estacion al seleccionar ubicacion en el mapa
  const fetchStationBikes = async (stationId) => {
    try {
      const bikesData = await getStationBikes.get(
        `/bikes/${stationId}/EstacionesBici`
      );

      // formatear bicicletas
      const formattedBikes = bikesData.map((bike) => ({
        id: bike.id,
        type: bike.tipo === 'Mecanica' ? 'mechanical' : 'electric',
        available: bike.estado === 'Disponible',
      }));

      // actualizar lista de bicicletas en la estacion correspondiente
      setBikeStations((prevStations) =>
        prevStations.map((station) =>
          station.id === stationId
            ? { ...station, bikes: formattedBikes }
            : station
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

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
            <Marker
              key={station.id}
              position={station.position}
              eventHandlers={{
                click: () => fetchStationBikes(station.id),
              }}
            >
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
