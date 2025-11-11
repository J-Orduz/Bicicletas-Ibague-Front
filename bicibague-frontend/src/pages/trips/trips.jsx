import { useState, useEffect } from 'react';
// icons
import {
  FaBicycle,
  FaBolt,
  FaRegClock,
  FaRegCalendar,
  FaRegCalendarCheck,
  FaMoneyBillWave,
  FaBatteryHalf,
} from 'react-icons/fa6';
// import { MdOutlineStopCircle } from 'react-icons/md';
import { GiPathDistance } from 'react-icons/gi';
import { PiSneakerFill } from 'react-icons/pi';
// components
import { SubHeader } from '@layouts/SubHeader';
// styles
import './trips.scss';

export const Trips = () => {
  // TEMPORAL: Cargar viaje actual desde localStorage para simular persistencia
  // TODO: Reemplazar con datos reales de la API
  const [currentTrip, setCurrentTrip] = useState(() => {
    const savedTrip = localStorage.getItem('currentTrip');
    return savedTrip ? JSON.parse(savedTrip) : null;
  });

  const [tripHistory] = useState([
    {
      id: 8,
      bikeId: 'BIC-045',
      bikeType: 'mecanica',
      startTime: '2025-11-08T14:20:00',
      endTime: '2025-11-08T15:45:00',
      duration: '1h 25m',
      charge: 4500,
    },
    {
      id: 7,
      bikeId: 'BIC-032',
      bikeType: 'electrica',
      startTime: '2025-11-07T09:15:00',
      endTime: '2025-11-07T10:30:00',
      duration: '1h 15m',
      charge: 3750,
    },
    {
      id: 6,
      bikeId: 'BIC-018',
      bikeType: 'mecanica',
      startTime: '2025-11-05T16:00:00',
      endTime: '2025-11-05T16:45:00',
      duration: '45m',
      charge: 2250,
    },
    {
      id: 5,
      bikeId: 'BIC-027',
      bikeType: 'electrica',
      startTime: '2025-11-03T11:45:00',
      endTime: '2025-11-03T13:20:00',
      duration: '1h 35m',
      charge: 4750,
    },
  ]);

  // Estado para el contador del viaje actual
  const [elapsedTime, setElapsedTime] = useState('00:00');

  // Efecto para calcular el tiempo transcurrido
  useEffect(() => {
    if (!currentTrip) return;

    const updateElapsedTime = () => {
      const start = new Date(currentTrip.startTime);
      const now = new Date();
      const diff = now - start;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsedTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
          2,
          '0'
        )}:${String(seconds).padStart(2, '0')}`
      );
    };

    // Actualizar inmediatamente
    updateElapsedTime();

    // Actualizar cada segundo
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [currentTrip]);

  // TEMPORAL: Función para finalizar el viaje y limpiar localStorage
  // TODO: Reemplazar con llamada real a la API
  // const handleEndTrip = () => {
  //   const confirmEnd = window.confirm(
  //     '¿Estás seguro de que deseas finalizar el viaje?'
  //   );
  //   if (confirmEnd) {
  //     console.log('Viaje finalizado:', currentTrip.id);
  //     // Limpiar el viaje actual del localStorage
  //     localStorage.removeItem('currentTrip');
  //     // Actualizar el estado para ocultar el viaje actual
  //     setCurrentTrip(null);
  //   }
  // };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getBikeTypeIcon = (type) => {
    return type === 'electrica' ? (
      <FaBolt className="bike-type-icon electric" />
    ) : (
      <PiSneakerFill className="bike-type-icon mechanical" />
    );
  };

  const getBatteryClass = (battery) => {
    if (battery >= 60) return 'battery-high';
    if (battery >= 30) return 'battery-medium';
    return 'battery-low';
  };

  return (
    // <section className="trips-container">
    <>
      <div className="trips-container">
        <SubHeader pageTitle="Viajes" />

        {/* Sección de Viaje Actual */}
        <div className="current-trip-section">
          <h2 className="section-title">Viaje Actual</h2>

          {currentTrip ? (
            <div className="current-trip-card">
              <div className="trip-header">
                <div className="bike-info">
                  <div className="bike-id-container">
                    <FaBicycle className="bike-icon" />
                    <h3 className="bike-id">{currentTrip.bikeId}</h3>
                    {getBikeTypeIcon(currentTrip.bikeType)}
                  </div>
                  {currentTrip.bikeType === 'electrica' && (
                    <div className="battery-indicator">
                      <div
                        className={`battery-bar ${getBatteryClass(
                          currentTrip.battery
                        )}`}
                      >
                        <div
                          className="battery-fill"
                          style={{ width: `${currentTrip.battery}%` }}
                        >
                          <FaBatteryHalf className="battery-icon" />
                          <span className="battery-percentage">
                            {currentTrip.battery}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="trip-timer">
                <FaRegClock className="timer-icon" />
                <div className="timer-display">{elapsedTime}</div>
              </div>

              <div className="trip-details">
                <div className="detail-item">
                  <FaRegCalendar className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Fecha de inicio</span>
                    <span className="detail-value">
                      {formatDate(currentTrip.startTime)}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaRegClock className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Hora de inicio</span>
                    <span className="detail-value">
                      {formatTime(currentTrip.startTime)}
                    </span>
                  </div>
                </div>
              </div>

              {/* <div className="trip-actions">
                <button className="btn btn-end" onClick={handleEndTrip}>
                  <MdOutlineStopCircle className="btn-icon" />
                  Finalizar Viaje
                </button>
              </div> */}
            </div>
          ) : (
            <div className="no-trip">
              <FaBicycle className="no-trip-icon" />
              <p className="no-trip-text">No tienes ningún viaje en progreso</p>
              <p className="no-trip-hint">
                Desbloquea una reserva para comenzar un viaje
              </p>
            </div>
          )}
        </div>

        {/* Sección de Historial */}
        <div className="history-section">
          <h2 className="section-title">Historial de Viajes</h2>

          {tripHistory.length > 0 ? (
            <div className="history-list">
              {tripHistory.map((trip) => (
                <div key={trip.id} className="history-card">
                  <div className="history-card-header">
                    <div className="bike-info-small">
                      <FaBicycle className="bike-icon-small" />
                      <h3 className="bike-id-small">{trip.bikeId}</h3>
                      {getBikeTypeIcon(trip.bikeType)}
                    </div>
                    <div className="charge-amount">
                      <FaMoneyBillWave className="charge-icon" />
                      {formatCurrency(trip.charge)} COP
                    </div>
                  </div>

                  <div className="history-card-body">
                    <div className="history-detail">
                      <FaRegCalendar className="history-icon" />
                      <div className="history-content">
                        <span className="history-label">Inicio:</span>
                        <span className="history-value">
                          {formatDate(trip.startTime)} -{' '}
                          {formatTime(trip.startTime)}
                        </span>
                      </div>
                    </div>

                    <div className="history-detail">
                      <FaRegCalendarCheck className="history-icon" />
                      <div className="history-content">
                        <span className="history-label">Fin:</span>
                        <span className="history-value">
                          {formatDate(trip.endTime)} -{' '}
                          {formatTime(trip.endTime)}
                        </span>
                      </div>
                    </div>

                    <div className="history-detail">
                      <GiPathDistance className="history-icon" />
                      <div className="history-content">
                        <span className="history-label">Duración:</span>
                        <span className="history-value">{trip.duration}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-history">
              <p>No hay viajes en el historial</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
