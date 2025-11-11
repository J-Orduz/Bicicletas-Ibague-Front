import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// icons
import { FaRegClock, FaPlus, FaRegCalendar, FaBicycle } from 'react-icons/fa6';
import { MdOutlinePlayCircleOutline } from 'react-icons/md';
import { BsXLg } from 'react-icons/bs';
// components
import { UnlockBike } from './UnlockBike';
import { SubHeader } from '@layouts/SubHeader';
// styles
import './Reserves.scss';

export const Reserves = () => {
  const navigate = useNavigate();
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // Mock data - Reemplazar con datos reales de la API
  const [currentReservation, setCurrentReservation] = useState({
    id: 1,
    bikeId: 'BIC-001',
    createdAt: '2025-11-09T10:30:00',
    status: 'activa',
  });

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
    // Aquí implementarías la lógica para cancelar la reserva
    const confirmCancel = window.confirm(
      '¿Estás seguro de que deseas cancelar esta reserva?'
    );
    if (confirmCancel) {
      console.log('Reserva cancelada:', currentReservation.id);
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
    // <section className="reserves-container">
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

              <div className="reservation-details">
                <div className="detail-item">
                  <FaRegCalendar className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Fecha de reserva</span>
                    <span className="detail-value">
                      {formatDate(currentReservation.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaRegClock className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">Hora de reserva</span>
                    <span className="detail-value">
                      {formatTime(currentReservation.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="reservation-actions">
                <button className="btn btn-start" onClick={handleStartTrip}>
                  <MdOutlinePlayCircleOutline className="btn-icon" />
                  Iniciar Viaje
                </button>
                <button
                  className="btn-cancel"
                  onClick={handleCancelReservation}
                >
                  <BsXLg className="btn-icon" />
                  Cancelar Reserva
                </button>
              </div>
            </div>
          ) : (
            <div className="no-reservation">
              <FaRegClock ck className="no-reservation-icon" />
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
      {/* </section> */}
    </>
  );
};
