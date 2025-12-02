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
import { useGetCurrentTrip } from '@api/trips';
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
  const [hasActiveTrip, setHasActiveTrip] = useState(false);

  // Coordenadas de Ibagué, Colombia
  const center = [4.4389, -75.2322];

  // --- Obtener estaciones y bicicletas ---
  const [bikeStations, setBikeStations] = useState([]);

  const getStations = useGetStations();
  const getStationBikes = useGetStationBikes();
  const getCurrentTrip = useGetCurrentTrip();

  // Verificar si hay viaje activo
  useEffect(() => {
    const checkActiveTrip = async () => {
      try {
        const tripData = await getCurrentTrip.get();
        console.log('Datos del viaje activo:', tripData);
        setHasActiveTrip(tripData.data !== null);
      } catch (error) {
        console.error('Error al verificar viaje activo:', error);
        setHasActiveTrip(false);
      }
    };

    checkActiveTrip();
  }, []);

  // Función para cargar/refrescar estaciones
  const fetchStations = async () => {
    try {
      const stationsData = await getStations.get();

      // formatear datos de la estacion para el mapa
      const formattedStations = stationsData.map((station) => ({
        id: station.id,
        name: station.nombre,
        position: [station.posicion.latitud, station.posicion.longitud],
        bikes: [],
        redistributionDate: station.fecha_redistribucion,
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

  useEffect(() => {
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
                  hasActiveTrip={hasActiveTrip}
                  redistributionDate={station.redistributionDate}
                  onRefreshStations={fetchStations}
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

const CountdownTimer = ({ redistributionDate, onCountdownComplete }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const redistribution = new Date(redistributionDate);
      const difference = redistribution - now;

      if (difference <= 0) {
        setTimeLeft('Redistribución en progreso');
        
        // Ejecutar callback solo una vez cuando llegue a 0
        if (!hasCompleted && onCountdownComplete) {
          setHasCompleted(true);
          onCountdownComplete();
        }
        return;
      }

      const minutes = Math.floor(difference / 1000 / 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
          2,
          '0'
        )}`
      );
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [redistributionDate, hasCompleted, onCountdownComplete]);

  return <span className="countdown-timer">{timeLeft}</span>;
};

export const BikeStationPopup = ({
  name,
  bikes,
  onReserveClick,
  hasActiveTrip,
  redistributionDate,
  onRefreshStations,
}) => {
  const totalCapacity = 15;
  const availableBikes = bikes.filter((bike) => bike.available);

  const getButtonConfig = () => {
    if (hasActiveTrip) {
      return {
        text: 'Ya tienes un viaje activo. Finalízalo para iniciar una nueva reserva',
        className: 'btn-reserve active-trip',
        disabled: true,
      };
    }
    if (availableBikes.length === 0) {
      return {
        text: 'No hay bicicletas disponibles',
        className: 'btn-reserve',
        disabled: true,
      };
    }
    return {
      text: 'Ver Bicicletas Disponibles',
      className: 'btn-reserve',
      disabled: false,
    };
  };

  const buttonConfig = getButtonConfig();

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
        {redistributionDate && (
          <div className="redistribution-info">
            <span className="redistribution-text">Llegarán nuevas bicicletas en: </span>
            <CountdownTimer 
              redistributionDate={redistributionDate}
              onCountdownComplete={onRefreshStations}
            />
          </div>
        )}
      </div>

      <button
        className={buttonConfig.className}
        onClick={onReserveClick}
        disabled={buttonConfig.disabled}
      >
        {buttonConfig.text}
      </button>
    </div>
  );
};
