// leaftlet map. Tutorial: https://leafletjs.com/examples.html
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// hooks
import { useNotifier } from '@hooks/useNotifier';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { FaBicycle, FaBatteryHalf } from 'react-icons/fa6';
// Fix para los iconos de Leaflet en Vite/React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
// components
import { ReserveBike } from './ReserveBike.jsx';
// api
import { useGetStations, useGetStationBikes, useGetBikeTelemetry } from '@api/bikes';
import { useGetCurrentTrip } from '@api/trips';
import { useGetCurrentReservation } from '@api/reserves';
// styles
import './MapView.scss';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Icono personalizado para la bicicleta en uso usando react-icons
const bikeIconSvg = renderToStaticMarkup(
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
    <circle cx="24" cy="24" r="23" fill="#ff922d" opacity="0.95"/>
    <g transform="translate(12, 12)">
      <FaBicycle color="white" size={24} />
    </g>
  </svg>
);

const bikeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(bikeIconSvg),
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -24],
});

export const MapView = ({ onStationsLoaded, onBikeTelemetryUpdate }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const notify = useNotifier();
  const [selectedStation, setSelectedStation] = useState(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);
  const [hasActiveReservation, setHasActiveReservation] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [bikeTelemetry, setBikeTelemetry] = useState(null);

  // Coordenadas de Ibagué, Colombia
  const center = [4.4389, -75.2322];

  // --- Obtener estaciones y bicicletas ---
  const [bikeStations, setBikeStations] = useState([]);

  const getStations = useGetStations();
  const getStationBikes = useGetStationBikes();
  const getCurrentTrip = useGetCurrentTrip();
  const getCurrentReservation = useGetCurrentReservation();
  const getBikeTelemetry = useGetBikeTelemetry();

  // Verificar si hay viaje activo y obtener datos
  useEffect(() => {
    const checkActiveTrip = async () => {
      try {
        const tripData = await getCurrentTrip.get();
        console.log('Datos del viaje activo:', tripData);
        const hasTrip = tripData.data !== null;
        setHasActiveTrip(hasTrip);
        setCurrentTrip(hasTrip ? tripData.data : null);
      } catch (error) {
        console.error('Error al verificar viaje activo:', error);
        setHasActiveTrip(false);
        setCurrentTrip(null);
      }
    };

    checkActiveTrip();
  }, []);

  // Verificar si hay reserva activa
  useEffect(() => {
    const checkActiveReservation = async () => {
      try {
        const reservationData = await getCurrentReservation.get();
        console.log('Datos de la reserva activa:', reservationData);
        setHasActiveReservation(reservationData.data !== null);
      } catch (error) {
        console.error('Error al verificar reserva activa:', error);
        setHasActiveReservation(false);
      }
    };

    checkActiveReservation();
  }, []);

  // Obtener telemetría de la bicicleta cada 3 segundos si hay viaje activo
  useEffect(() => {
    if (!currentTrip || !currentTrip.bicicleta?.id) {
      setBikeTelemetry(null);
      return;
    }

    const fetchTelemetry = async () => {
      try {
        const telemetryData = await getBikeTelemetry.get(currentTrip.bicicleta.id);
        
        if (telemetryData) {
          console.log('Telemetría obtenida:', telemetryData);
          setBikeTelemetry(telemetryData);
          
          // Verificar si el candado está bloqueado
          if (telemetryData.estadoCandado === 'Bloqueado') {
            console.log('Candado bloqueado detectado. Viaje finalizado.');
            notify.success(t('mapView.tripFinalized'));
            
            // Actualizar estado del viaje
            setHasActiveTrip(false);
            setCurrentTrip(null);
            setBikeTelemetry(null);
            
            // Redirigir a la página de viajes
            navigate('/trips');
            
            return;
          }
          
          // Notificar al componente padre
          if (onBikeTelemetryUpdate) {
            onBikeTelemetryUpdate(telemetryData);
          }
        }
      } catch (error) {
        console.error('Error al obtener telemetría:', error);
      }
    };

    // Obtener telemetría inmediatamente
    fetchTelemetry();

    // Configurar polling cada 3 segundos
    const intervalId = setInterval(fetchTelemetry, 3000);

    // Limpiar intervalo al desmontar o cuando cambie el viaje
    return () => clearInterval(intervalId);
  }, [currentTrip]);

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

  const getBatteryClass = (battery) => {
    if (battery >= 60) return 'battery-high';
    if (battery >= 30) return 'battery-medium';
    return 'battery-low';
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
                  hasActiveReservation={hasActiveReservation}
                  redistributionDate={station.redistributionDate}
                  onRefreshStations={fetchStations}
                />
              </Popup>
            </Marker>
          ))}

          {/* Marcador de bicicleta en uso */}
          {bikeTelemetry && bikeTelemetry.latitud && bikeTelemetry.longitud && (
            <Marker
              position={[bikeTelemetry.latitud, bikeTelemetry.longitud]}
              icon={bikeIcon}
              zIndexOffset={1000}
            >
              <Popup className="bike-telemetry-popup" maxWidth={320}>
                <div className="telemetry-info">
                  <h4>{t('mapView.bikeInUse')}</h4>
                  <div className="telemetry-content">
                    <div className="telemetry-row">
                      <span className="telemetry-label">{t('mapView.id')}:</span>
                      <span className="telemetry-value">{bikeTelemetry.IDbicicleta}</span>
                    </div>
                    {bikeTelemetry.bateria !== null && (
                      <div className="telemetry-row battery-row">
                        <span className="telemetry-label">{t('mapView.battery')}:</span>
                        <div className="battery-indicator-popup">
                          <div className={`battery-bar ${getBatteryClass(bikeTelemetry.bateria)}`}>
                            <div
                              className="battery-fill"
                              style={{ width: `${bikeTelemetry.bateria}%` }}
                            >
                              <FaBatteryHalf className="battery-icon" />
                              <span className="battery-percentage">
                                {bikeTelemetry.bateria}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="telemetry-row last-update">
                      <span className="telemetry-label">{t('mapView.lastUpdate')}:</span>
                      <span className="telemetry-value telemetry-time">
                        {new Date(bikeTelemetry.fechaConsulta).toLocaleString('es-CO')}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </section>

      {showReserveModal && selectedStation && (
        <ReserveBike station={selectedStation} onClose={handleCloseReserve} />
      )}
    </>
  );
};

const CountdownTimer = ({ redistributionDate, onCountdownComplete }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState('');
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const redistribution = new Date(redistributionDate);
      const difference = redistribution - now;

      if (difference <= 0) {
        setTimeLeft(t('mapView.redistributionInProgress'));
        
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
  hasActiveReservation,
  redistributionDate,
  onRefreshStations,
}) => {
  const { t } = useTranslation();
  const totalCapacity = 15;
  const availableBikes = bikes.filter((bike) => bike.available);

  const getButtonConfig = () => {
    if (hasActiveTrip) {
      return {
        text: t('mapView.tripInProgress'),
        className: 'btn-reserve active-trip',
        disabled: true,
      };
    }
    if (hasActiveReservation) {
      return {
        text: t('mapView.activeReservation'),
        className: 'btn-reserve active-reservation',
        disabled: true,
      };
    }
    if (availableBikes.length === 0) {
      return {
        text: t('mapView.noBikesAvailable'),
        className: 'btn-reserve',
        disabled: true,
      };
    }
    return {
      text: t('mapView.viewAvailableBikes'),
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
          <span className="stat-label">{t('mapView.available')}:</span>
          <span className="stat-value">
            {availableBikes.length} / {totalCapacity}
          </span>
        </div>
        {redistributionDate && (
          <div className="redistribution-info">
            <span className="redistribution-text">{t('mapView.newBikesArriving')}: </span>
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
