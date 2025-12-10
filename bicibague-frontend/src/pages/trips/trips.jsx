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
  FaCircleCheck,
  // FaTimesCircle,
} from 'react-icons/fa6';
import { MdOutlineStopCircle } from 'react-icons/md';
import { GiPathDistance } from 'react-icons/gi';
import { PiSneakerFill } from 'react-icons/pi';
// components
import { SubHeader } from '@layouts/SubHeader';
import { EndTrip } from './EndTrip';
// hooks
import { useCurrency } from '@hooks/useCurrency';
// api
import {
  useGetCurrentTrip,
  useGetTripHistory,
  useEndTripMutation,
} from '@api/trips';
import { useGetBikeTelemetry } from '@api/bikes';
// styles
import './trips.scss';

export const Trips = () => {
  const { formatCurrency } = useCurrency();
  const { get: getCurrentTrip } = useGetCurrentTrip();
  const { get: getTripHistory } = useGetTripHistory();
  const { post: endTrip } = useEndTripMutation();
  const getBikeTelemetry = useGetBikeTelemetry();

  const [currentTrip, setCurrentTrip] = useState(null);
  const [loadingCurrentTrip, setLoadingCurrentTrip] = useState(true);
  const [tripHistory, setTripHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [tripEndData, setTripEndData] = useState(null);
  const [bikeTelemetry, setBikeTelemetry] = useState(null);

  // Cargar viaje actual desde la API
  useEffect(() => {
    const loadCurrentTrip = async () => {
      try {
        setLoadingCurrentTrip(true);
        const response = await getCurrentTrip();
        if (response?.success && response?.data) {
          setCurrentTrip(response.data);
        } else {
          setCurrentTrip(null);
        }
      } catch (error) {
        console.error('Error al cargar el viaje actual:', error);
        setCurrentTrip(null);
      } finally {
        setLoadingCurrentTrip(false);
      }
    };

    loadCurrentTrip();
  }, []);

  // Cargar historial de viajes desde la API
  useEffect(() => {
    const loadTripHistory = async () => {
      try {
        setLoadingHistory(true);
        const response = await getTripHistory();
        if (response?.success && response?.data?.viajes) {
          setTripHistory(response.data.viajes);
        }
      } catch (error) {
        console.error('Error al cargar el historial:', error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadTripHistory();
  }, []);

  // Estado para el contador del viaje actual
  const [elapsedTime, setElapsedTime] = useState('00:00');

  // Estado para el modal de finalizar viaje
  const [showEndTripModal, setShowEndTripModal] = useState(false);

  // Obtener telemetría de la bicicleta cada 3 segundos si hay viaje activo
  useEffect(() => {
    if (!currentTrip || !currentTrip.bicicleta?.id) {
      setBikeTelemetry(null);
      return;
    }

    const fetchTelemetry = async () => {
      try {
        const telemetryData = await getBikeTelemetry.get(
          currentTrip.bicicleta.id
        );

        if (telemetryData && telemetryData.bateria !== null) {
          setBikeTelemetry(telemetryData);
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

  // Efecto para calcular el tiempo transcurrido
  useEffect(() => {
    if (!currentTrip) return;

    const updateElapsedTime = () => {
      const start = new Date(currentTrip.fecha_inicio);
      const now = new Date();
      const diff = Math.max(0, now - start); // Asegurar que no sea negativo

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

  // Función para finalizar el viaje y abrir el modal
  const handleEndTrip = async () => {
    if (!currentTrip) return;

    try {
      setLoadingCurrentTrip(true);
      const response = await endTrip({ viajeId: currentTrip.id });

      if (response?.success && response?.data) {
        // Guardar datos de finalización
        const paymentData = {
          ...response.data,
          bicicletaId: currentTrip.bicicleta.id,
        };
        setTripEndData(paymentData);

        // Recargar viaje actual y historial
        const [currentResponse, historyResponse] = await Promise.all([
          getCurrentTrip(),
          getTripHistory(),
        ]);

        if (currentResponse?.success && currentResponse?.data) {
          setCurrentTrip(currentResponse.data);
        } else {
          setCurrentTrip(null);
        }

        if (historyResponse?.success && historyResponse?.data?.viajes) {
          setTripHistory(historyResponse.data.viajes);
        }

        setShowEndTripModal(true);
      } else {
        alert('Error al finalizar el viaje');
      }
    } catch (error) {
      console.error('Error al finalizar el viaje:', error);
      alert('Error al finalizar el viaje. Por favor, intenta de nuevo.');
    } finally {
      setLoadingCurrentTrip(false);
    }
  };

  // Función para cerrar el modal
  const handleCloseEndTripModal = () => {
    setShowEndTripModal(false);
  };

  // Función para abrir modal de pago desde el historial
  const handlePayTrip = (trip) => {
    // Crear datos de pago del viaje basados en el historial
    const paymentData = {
      id: trip.id,
      tiempoViaje: trip.duracion,
      precioSubtotal: trip.subtotal, // Aproximación quitando impuesto
      impuesto: trip.impuesto, // 3% de impuesto
      tiempoExtra: Math.max(
        0,
        trip.duracion - (trip.tipo_viaje === 'MILLA' ? 45 : 75)
      ),
      precioTotal: trip.precio,
      precioDescuento: trip.precioDescuento || 0,
      bicicletaId: trip.bicicleta.id,
    };
    setTripEndData(paymentData);
    setShowEndTripModal(true);
  };

  // Función para manejar cuando el viaje finaliza exitosamente (pago completado)
  const handleTripEnded = async () => {
    setTripEndData(null);
    setCurrentTrip(null);
    setShowEndTripModal(false);

    // Recargar el viaje actual y el historial desde la API
    try {
      const [currentResponse, historyResponse] = await Promise.all([
        getCurrentTrip(),
        getTripHistory(),
      ]);

      if (currentResponse?.success && currentResponse?.data) {
        setCurrentTrip(currentResponse.data);
      } else {
        setCurrentTrip(null);
      }

      if (historyResponse?.success && historyResponse?.data?.viajes) {
        setTripHistory(historyResponse.data.viajes);
      }
    } catch (error) {
      console.error('Error al recargar los datos:', error);
    }
  };

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

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
  };

  const formatDistance = (km) => {
    if (!km) return 'N/A';
    return `${km.toFixed(2)} km`;
  };

  const getTripTypeLabel = (type) => {
    return type === 'MILLA' ? 'Última Milla' : 'Recorrido Largo';
  };

  const getTripMaxTime = (type) => {
    return type === 'MILLA' ? '45 min' : '75 min';
  };

  const getTripBasePrice = (type) => {
    return type === 'MILLA' ? 17500 : 25000;
  };

  const getTripExtraMinutePrice = (type) => {
    return type === 'MILLA' ? 250 : 1000;
  };

  const getPaymentStatusIcon = (status) => {
    return status === 'PAGADO' ? (
      <FaCircleCheck className="payment-icon paid" />
    ) : (
      <FaRegClock className="payment-icon pending" />
    );
  };

  const getPaymentStatusLabel = (status) => {
    return status === 'PAGADO' ? 'Pagado' : 'Pendiente';
  };

  const getBikeTypeIcon = (type) => {
    return type === 'electric' ? (
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
    <>
      <div className="trips-container">
        <SubHeader pageTitle="Viajes" />

        {/* Sección de Viaje Actual */}
        <div className="current-trip-section">
          <h2 className="section-title">Viaje Actual</h2>

          {loadingCurrentTrip ? (
            <div className="no-trip">
              <p className="no-trip-text">Cargando viaje actual...</p>
            </div>
          ) : currentTrip ? (
            <div className="current-trip-card">
              <div className="trip-header">
                <div className="bike-info">
                  <div className="bike-id-container">
                    <FaBicycle className="bike-icon" />
                    <h3 className="bike-id">{currentTrip.bicicleta.id}</h3>
                    {getBikeTypeIcon(
                      currentTrip.bicicleta.tipo === 'Electrica'
                        ? 'electric'
                        : 'mechanical'
                    )}
                  </div>
                  {currentTrip.bicicleta.tipo === 'Electrica' &&
                    bikeTelemetry?.bateria !== null && (
                      <div className="battery-indicator">
                        <div
                          className={`battery-bar ${getBatteryClass(
                            bikeTelemetry?.bateria
                          )}`}
                        >
                          <div
                            className="battery-fill"
                            style={{ width: `${bikeTelemetry?.bateria}%` }}
                          >
                            <FaBatteryHalf className="battery-icon" />
                            <span className="battery-percentage">
                              {bikeTelemetry?.bateria}%
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
                      {formatDate(currentTrip.fecha_inicio)}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaRegClock className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Hora de inicio</span>
                    <span className="detail-value">
                      {formatTime(currentTrip.fecha_inicio)}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaBicycle className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Tipo de viaje</span>
                    <span className="detail-value">
                      {getTripTypeLabel(currentTrip.tipo_viaje)} (máx:{' '}
                      {getTripMaxTime(currentTrip.tipo_viaje)})
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaMoneyBillWave className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Precio del viaje</span>
                    <span className="detail-value">
                      {formatCurrency(getTripBasePrice(currentTrip.tipo_viaje))}{' '}
                      +{' '}
                      {formatCurrency(
                        getTripExtraMinutePrice(currentTrip.tipo_viaje)
                      )}
                      /min. extra
                    </span>
                  </div>
                </div>
              </div>

              <div className="trip-actions">
                <button className="btn btn-end" onClick={handleEndTrip}>
                  <MdOutlineStopCircle className="btn-icon" />
                  Finalizar Viaje (boton de simulación)
                </button>
              </div>
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

          {loadingHistory ? (
            <div className="no-history">
              <p>Cargando historial...</p>
            </div>
          ) : tripHistory.length > 0 ? (
            <div className="history-list">
              {tripHistory.map((trip) => (
                <div key={trip.id} className="history-card">
                  <div className="history-card-header">
                    <div className="bike-info-small">
                      <FaBicycle className="bike-icon-small" />
                      <h3 className="bike-id-small">{trip.bicicleta.id}</h3>
                      {getBikeTypeIcon(
                        trip.bicicleta.tipo === 'Electrica'
                          ? 'electric'
                          : 'mechanical'
                      )}
                    </div>
                    <div className="charge-amount">
                      <FaMoneyBillWave className="charge-icon" />
                      {trip.precio
                        ? formatCurrency(trip?.precioDescuento || trip.precio)
                        : 'N/A'}
                    </div>
                  </div>

                  <div className="history-card-body">
                    <div className="history-detail">
                      <FaRegCalendar className="history-icon" />
                      <div className="history-content">
                        <span className="history-label">Inicio:</span>
                        <span className="history-value">
                          {formatDate(trip.fechas.inicio)} -{' '}
                          {formatTime(trip.fechas.inicio)}
                        </span>
                      </div>
                    </div>

                    <div className="history-detail">
                      <FaRegCalendarCheck className="history-icon" />
                      <div className="history-content">
                        <span className="history-label">Fin:</span>
                        <span className="history-value">
                          {trip.fechas.fin
                            ? `${formatDate(trip.fechas.fin)} - ${formatTime(
                                trip.fechas.fin
                              )}`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="history-detail">
                      <FaRegClock className="history-icon" />
                      <div className="history-content">
                        <span className="history-label">Duración:</span>
                        <span className="history-value">
                          {formatDuration(trip.duracion)}
                        </span>
                      </div>
                    </div>

                    <div className="history-detail">
                      <GiPathDistance className="history-icon" />
                      <div className="history-content">
                        <span className="history-label">Distancia:</span>
                        <span className="history-value">
                          {formatDistance(trip.distancia)}
                        </span>
                      </div>
                    </div>

                    <div className="history-detail">
                      <FaBicycle className="history-icon" />
                      <div className="history-content">
                        <span className="history-label">Tipo de viaje:</span>
                        <span className="history-value">
                          {getTripTypeLabel(trip.tipo_viaje)}
                        </span>
                      </div>
                    </div>

                    <div className="history-detail payment-status">
                      {getPaymentStatusIcon(trip.estado_pago)}
                      <div className="history-content">
                        <span className="history-label">Estado de pago:</span>
                        <span
                          className={`history-value payment-${trip.estado_pago.toLowerCase()}`}
                        >
                          {getPaymentStatusLabel(trip.estado_pago)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Botón para pagar si el estado es PENDIENTE */}
                  {trip.estado_pago === 'PENDIENTE' && trip.precio && (
                    <div className="history-card-footer">
                      <button
                        className="btn btn-pay-trip"
                        onClick={() => handlePayTrip(trip)}
                      >
                        <FaMoneyBillWave className="btn-icon" />
                        Pagar{' '}
                        {formatCurrency(trip.precioDescuento || trip.precio)}
                      </button>
                    </div>
                  )}
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

      {/* Modal de finalizar viaje */}
      {showEndTripModal && tripEndData && (
        <EndTrip
          trip={currentTrip}
          tripEndData={tripEndData}
          onClose={handleCloseEndTripModal}
          onTripEnded={handleTripEnded}
        />
      )}
    </>
  );
};
