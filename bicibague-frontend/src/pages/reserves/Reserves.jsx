import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// components
import { UnlockBike } from './UnlockBike';
import { SubHeader } from '@layouts/SubHeader';
// api
import { useGetCurrentReservation } from '@api/reserves';
// icons
import { FaRegClock, FaPlus, FaRegCalendar, FaBicycle, FaLocationDot } from 'react-icons/fa6';
import { TbClockOff } from 'react-icons/tb';
import { MdOutlinePlayCircleOutline } from 'react-icons/md';
import { BsXLg } from 'react-icons/bs';
// styles
import './Reserves.scss';

export const Reserves = () => {
  const navigate = useNavigate();
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  const [currentReservation, setCurrentReservation] = useState(null);
  const getCurrentReservation = useGetCurrentReservation();

  // Estado para el contador regresivo
  const [remainingTime, setRemainingTime] = useState('00:00:00');
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Obtener reserva actual desde la API
  useEffect(() => {
    const fetchCurrentReservation = async () => {
      try {
        const reservation = await getCurrentReservation.get();

        if (reservation.data === null) {
          setCurrentReservation(null);
          return;
        }

        const reservationData = {
          id: reservation.data.id,
          reserveDate: reservation.data.timestamp_reserva,
          reserveExpiry: reservation.data.timestamp_expiracion,
          bikeId: reservation.data.Bicicleta.id,
          bikeType: reservation.data.Bicicleta.tipo,
          estation: reservation.data.Bicicleta.Estacion.nombre,
          status: reservation.data.estado_reserva,
        };
        setCurrentReservation(reservationData);
      } catch (error) {
        console.error(error.errorFetchMsg || error);
      }
    };

    fetchCurrentReservation();
  }, []);

  // Efecto para calcular el tiempo restante de la reserva
  useEffect(() => {
    if (!currentReservation) return;

    const updateRemainingTime = () => {
      const now = new Date();
      const reserveStart = new Date(currentReservation.reserveDate);
      const reserveExpiry = new Date(currentReservation.reserveExpiry);

      // Verificar si la reserva ya ha comenzado
      if (now < reserveStart) {
        setHasStarted(false);
        return;
      }

      setHasStarted(true);

      // Calcular tiempo restante hasta la expiración
      const diff = reserveExpiry - now;

      if (diff <= 0) {
        setRemainingTime('00:00:00');
        setIsExpiringSoon(true);
        setIsExpired(true);
        return;
      }

      setIsExpired(false);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setRemainingTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
          2,
          '0'
        )}:${String(seconds).padStart(2, '0')}`
      );

      // Activar efecto de advertencia si queda menos de 1 minuto
      setIsExpiringSoon(diff < 60000);
    };

    // Actualizar inmediatamente
    updateRemainingTime();

    // Actualizar cada segundo
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [currentReservation]);

  const [reservationHistory] = useState([
    {
      id: 5,
      bikeId: 'BIC-045',
      createdAt: '2025-11-08T14:20:00',
      completedAt: '2025-11-08T15:45:00',
      status: 'completada',
    },
    {
      id: 4,
      bikeId: 'BIC-032',
      createdAt: '2025-11-07T09:15:00',
      completedAt: '2025-11-07T10:30:00',
      status: 'completada',
    },
    {
      id: 3,
      bikeId: 'BIC-018',
      createdAt: '2025-11-05T16:00:00',
      completedAt: null,
      status: 'cancelada',
    },
    {
      id: 2,
      bikeId: 'BIC-027',
      createdAt: '2025-11-03T11:45:00',
      completedAt: null,
      status: 'perdida',
    },
  ]);

  const handleCancelReservation = () => {
    // TEMPORAL: Cancelar reserva y eliminar del localStorage
    // TODO: Implementar la lógica para cancelar la reserva en la API
    const confirmCancel = window.confirm(
      '¿Estás seguro de que deseas cancelar esta reserva?'
    );
    if (confirmCancel) {
      console.log('Reserva cancelada:', currentReservation.id);
      // Eliminar del localStorage
      localStorage.removeItem('currentReservation');
      // Actualizar el estado
      setCurrentReservation(null);
    }
  };

  const handleStartTrip = () => {
    setShowUnlockModal(true);
  };

  const handleReserveNow = () => {
    navigate('/');
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

  const getStatusClass = (status) => {
    switch (status) {
      case 'completada':
        return 'status-completed';
      case 'cancelada':
        return 'status-cancelled';
      case 'perdida':
        return 'status-lost';
      case 'activa':
        return 'status-active';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completada':
        return 'Completada';
      case 'cancelada':
        return 'Cancelada';
      case 'perdida':
        return 'Perdida';
      case 'activa':
        return 'Activa';
      default:
        return status;
    }
  };

  return (
    <>
      <div className="reserves-container">
        <SubHeader pageTitle="Reservas" />

        {/* Sección de Reserva Actual */}
        <div className="current-reservation-section">
          <h2 className="section-title">Reserva Actual</h2>

          {currentReservation ? (
            <div className="current-reservation-card">
              <div className="reservation-header">
                <div className="bike-info">
                  <div className="bike-id-container">
                    <FaBicycle className="bike-icon" />
                    <h3 className="bike-id">{currentReservation.bikeId}</h3>
                  </div>
                </div>
                <span
                  className={`status-badge ${getStatusClass(
                    currentReservation.status
                  )}`}
                >
                  {getStatusText(currentReservation.status)}
                </span>
              </div>

              {/* Contador regresivo o mensajes de tiempo agotado */}
              {hasStarted && (
                <>
                  {isExpired ? (
                    <div className="reservation-expired">
                      <TbClockOff className="expired-icon" />
                      <div className="expired-content">
                        <h3 className="expired-title">¡Tiempo Agotado!</h3>
                        <p className="expired-subtitle">Reserva Perdida</p>
                        <p className="expired-message">
                          Espera unos segundos para poder realizar otra reserva
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`reservation-timer ${
                        isExpiringSoon ? 'expiring-soon' : ''
                      }`}
                    >
                      <FaRegClock className="timer-icon" />
                      <div className="timer-content">
                        <span className="timer-label">
                          {isExpiringSoon
                            ? '¡Tiempo casi agotado!'
                            : 'Tiempo restante'}
                        </span>
                        <div className="timer-display">{remainingTime}</div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="reservation-details">
                <div className="detail-item">
                  <FaRegCalendar className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Fecha de reserva</span>
                    <span className="detail-value">
                      {formatDate(currentReservation.reserveDate)}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaRegClock className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Hora de reserva</span>
                    <span className="detail-value">
                      {formatTime(currentReservation.reserveDate)} -{' '}
                      {formatTime(currentReservation.reserveExpiry)} (Guardamos
                      tu reserva por 10 min. más)
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaLocationDot className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Estación</span>
                    <span className="detail-value">
                      {currentReservation.estation}
                    </span>
                  </div>
                </div>
              </div>

              <div className="reservation-actions">
                <button
                  className="btn btn-start"
                  onClick={handleStartTrip}
                  disabled={isExpired}
                >
                  <MdOutlinePlayCircleOutline className="btn-icon" />
                  Iniciar Viaje
                </button>
                <button
                  className="btn-cancel"
                  onClick={handleCancelReservation}
                  disabled={isExpired}
                >
                  <BsXLg className="btn-icon" />
                  Cancelar Reserva
                </button>
              </div>
            </div>
          ) : (
            <div className="no-reservation">
              <FaRegClock className="no-reservation-icon" />
              <p className="no-reservation-text">
                No tienes ninguna reserva activa
              </p>
              <button className="btn-reserve-now" onClick={handleReserveNow}>
                <FaPlus className="btn-icon" />
                Reservar Ahora
              </button>
            </div>
          )}
        </div>

        {/* Sección de Historial */}
        <div className="history-section">
          <h2 className="section-title">Historial de Reservas</h2>

          {reservationHistory.length > 0 ? (
            <div className="history-list">
              {reservationHistory.map((reservation) => (
                <div key={reservation.id} className="history-card">
                  <div className="history-card-header">
                    <div className="bike-info-small">
                      <FaBicycle className="bike-icon-small" />
                      <h3 className="bike-id-small">{reservation.bikeId}</h3>
                    </div>
                    <span
                      className={`status-badge ${getStatusClass(
                        reservation.status
                      )}`}
                    >
                      {getStatusText(reservation.status)}
                    </span>
                  </div>
                  <div className="history-card-body">
                    <div className="history-detail">
                      <FaRegCalendar className="history-icon" />
                      <div className="history-content">
                        <span className="history-label">Fecha:</span>
                        <span className="history-value">
                          {formatDate(reservation.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="history-detail">
                      <FaRegClock className="history-icon" />
                      <div className="history-content">
                        <span className="history-label">Hora:</span>
                        <span className="history-value">
                          {formatTime(reservation.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-history">
              <p>No hay reservas en el historial</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de desbloqueo */}
      {showUnlockModal && currentReservation && (
        <UnlockBike
          reservation={currentReservation}
          onClose={() => setShowUnlockModal(false)}
        />
      )}
    </>
  );
};
