import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// icons
import { FaRegClock } from 'react-icons/fa6';
// styles
import './Reserves.scss';

export const Reserves = () => {
  const navigate = useNavigate();

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
    // TODO: Implementar la lógica para iniciar el viaje
    console.log('Iniciar viaje:', currentReservation.id);
    alert('Función de iniciar viaje próximamente disponible');
  };

  const handleReserveNow = () => {
    navigate('/home');
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
    <section className="reserves-container">
      <div className="reserves-content">
        <h1 className="reserves-title">Reservas</h1>

        {/* Sección de Reserva Actual */}
        <div className="current-reservation-section">
          <h2 className="section-title">Reserva Actual</h2>

          {currentReservation ? (
            <div className="current-reservation-card">
              <div className="reservation-header">
                <div className="reservation-info">
                  <h3 className="bike-id">
                    Bicicleta: {currentReservation.bikeId}
                  </h3>
                  <div className="reservation-meta">
                    <p className="reservation-date">
                      <span className="meta-label">Fecha:</span>{' '}
                      {formatDate(currentReservation.createdAt)}
                    </p>
                    <p className="reservation-time">
                      <span className="meta-label">Hora:</span>{' '}
                      {formatTime(currentReservation.createdAt)}
                    </p>
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

              <div className="reservation-actions">
                <button className="btn btn-start" onClick={handleStartTrip}>
                  <svg
                    className="btn-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Iniciar Viaje
                </button>
                <button
                  className="btn-cancel"
                  onClick={handleCancelReservation}
                >
                  <svg
                    className="btn-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
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
              <button
                className="btn btn-reserve-now"
                onClick={handleReserveNow}
              >
                <svg
                  className="btn-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Reservar Ahora
              </button>
            </div>
          )}
        </div>

        {/* Sección de Historial */}
        <div className="history-section">
          <h2 className="section-title">Historial</h2>

          {reservationHistory.length > 0 ? (
            <div className="history-list">
              {reservationHistory.map((reservation) => (
                <div key={reservation.id} className="history-card">
                  <div className="history-card-header">
                    <h3 className="bike-id">Bicicleta: {reservation.bikeId}</h3>
                    <span
                      className={`status-badge ${getStatusClass(
                        reservation.status
                      )}`}
                    >
                      {getStatusText(reservation.status)}
                    </span>
                  </div>
                  <div className="history-card-body">
                    <div className="history-meta">
                      <div className="meta-item">
                        <svg
                          className="meta-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formatDate(reservation.createdAt)}</span>
                      </div>
                      <div className="meta-item">
                        <svg
                          className="meta-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{formatTime(reservation.createdAt)}</span>
                      </div>
                    </div>
                    {/* {reservation.completedAt && (
                      <div className="completion-info">
                        <svg
                          className="completion-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          Finalizada: {formatTime(reservation.completedAt)}
                        </span>
                      </div>
                    )} */}
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
    </section>
  );
};
