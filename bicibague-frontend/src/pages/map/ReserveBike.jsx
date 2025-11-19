import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// api
import { useReserveBikeMutation, useReserveBikeScheduledMutation } from '@api/reserves';
//icons
import { BsXLg } from 'react-icons/bs';
// styles
import './ReserveBike.scss';

export const ReserveBike = ({ station, onClose }) => {
  const navigate = useNavigate();
  const [selectedBike, setSelectedBike] = useState(null);
  const [reservationType, setReservationType] = useState('now'); // 'now' o 'scheduled'
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const reserveBikeMutation = useReserveBikeMutation();
  const reserveBikeScheduledMutation = useReserveBikeScheduledMutation();

  const totalCapacity = 15;
  const availableBikes = station.bikes.filter((bike) => bike.available);
  const availableMechanical = station.bikes.filter(
    (bike) => bike.type === 'mechanical' && bike.available
  );
  const availableElectric = station.bikes.filter(
    (bike) => bike.type === 'electric' && bike.available
  );

  const handleReserve = async () => {
    if (!selectedBike) {
      alert('Por favor selecciona una bicicleta');
      return;
    }

    // Validar fecha y hora si es reserva programada
    if (reservationType === 'scheduled') {
      if (!scheduledDate || !scheduledTime) {
        alert('Por favor selecciona fecha y hora para la reserva');
        return;
      }

      // Validar que la fecha sea futura
      const selectedDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();
      if (selectedDateTime <= now) {
        alert('La fecha y hora deben ser futuras');
        return;
      }
    }

    try {
      if (reservationType === 'now') {
        // Reserva inmediata
        await reserveBikeMutation.post({ bikeId: selectedBike });
        alert(`Bicicleta ${selectedBike} reservada exitosamente en ${station.name}`);
      } else {
        // Reserva programada
        // Construir la fecha y hora en formato ISO con zona horaria de Colombia (UTC-5)
        const fechaHoraProgramada = `${scheduledDate}T${scheduledTime}:00-05:00`;

        console.log('Fecha y hora programada:', fechaHoraProgramada);
        await reserveBikeScheduledMutation.post({
          bikeId: selectedBike,
          fechaHoraProgramada: fechaHoraProgramada
        });
        alert(`Bicicleta ${selectedBike} programada para ${scheduledDate} a las ${scheduledTime} en ${station.name}`);
      }

      onClose();
      navigate('/reserves');
    } catch (error) {
      alert(error.errorMutationMsg);
      return;
    }
  };

  // Cerrar modal al hacer clic en el overlay
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('reserve-modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="reserve-modal-overlay" onClick={handleOverlayClick}>
      <div className="reserve-modal">
        <div className="modal-header">
          <h1>{station.name}</h1>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">
            <BsXLg className="btn-icon" />
          </button>
        </div>

        <div className="modal-body">
          <div className="station-info">
            <div className="info-card">
              <span className="info-label">Total Disponibles</span>
              <span className="info-value">
                {availableBikes.length} / {totalCapacity}
              </span>
            </div>
          </div>

          <div className="bike-type-stats">
            <div className="type-stat mechanical">
              <span className="icon">🚴</span>
              <div className="type-info">
                <span className="type-label">Mecánicas</span>
                <span className="type-count">{availableMechanical.length}</span>
              </div>
            </div>
            <div className="type-stat electric">
              <span className="icon">⚡</span>
              <div className="type-info">
                <span className="type-label">Eléctricas</span>
                <span className="type-count">{availableElectric.length}</span>
              </div>
            </div>
          </div>

          {/* Tipo de reserva */}
          <div className="reservation-type">
            <h3>Tipo de reserva:</h3>
            <div className="type-options">
              <label className="type-option">
                <input
                  type="radio"
                  name="reservationType"
                  value="now"
                  checked={reservationType === 'now'}
                  onChange={(e) => setReservationType(e.target.value)}
                />
                <span className="option-content">
                  <span className="option-icon">🕒</span>
                  <span className="option-text">
                    <strong>Reservar Ahora</strong>
                    <small>Disponible inmediatamente</small>
                  </span>
                </span>
              </label>

              <label className="type-option">
                <input
                  type="radio"
                  name="reservationType"
                  value="scheduled"
                  checked={reservationType === 'scheduled'}
                  onChange={(e) => setReservationType(e.target.value)}
                />
                <span className="option-content">
                  <span className="option-icon">📅</span>
                  <span className="option-text">
                    <strong>Programar Reserva</strong>
                    <small>Elige fecha y hora</small>
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* Campos de fecha y hora si es programada */}
          {reservationType === 'scheduled' && (
            <div className="schedule-fields">
              <div className="field-group">
                <label htmlFor="scheduledDate" className="field-label">
                  Fecha:
                </label>
                <input
                  type="date"
                  id="scheduledDate"
                  className="field-input"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="field-group">
                <label htmlFor="scheduledTime" className="field-label">
                  Hora:
                </label>
                <input
                  type="time"
                  id="scheduledTime"
                  className="field-input"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="bike-list">
            <h3>Selecciona una bicicleta:</h3>

            {/* TODO: Simplificar */}
            {availableMechanical.length > 0 && (
              <div className="bike-category">
                <p className="category-title">Mecánicas</p>
                <div className="bikes-grid">
                  {availableMechanical.map((bike) => (
                    <BikeItem
                      key={bike.id}
                      bikeId={bike.id}
                      bikeType={bike.type}
                      selectedBike={selectedBike}
                      setSelectedBike={setSelectedBike}
                    />
                  ))}
                </div>
              </div>
            )}

            {availableElectric.length > 0 && (
              <div className="bike-category">
                <p className="category-title">Eléctricas</p>
                <div className="bikes-grid">
                  {availableElectric.map((bike) => (
                    <BikeItem
                      key={bike.id}
                      bikeId={bike.id}
                      bikeType={bike.type}
                      selectedBike={selectedBike}
                      setSelectedBike={setSelectedBike}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn-confirm"
            onClick={handleReserve}
            disabled={!selectedBike}
          >
            Reservar Bicicleta
          </button>
        </div>
      </div>
    </div>
  );
};

const BikeItem = ({ bikeId, bikeType, selectedBike, setSelectedBike }) => {
  return (
    <label key={bikeId} className="bike-item">
      <input
        type="radio"
        name="bike"
        value={bikeId}
        checked={selectedBike === bikeId}
        onChange={(e) => setSelectedBike(e.target.value)}
      />
      <span className="bike-content">
        <span className="bike-id">{bikeId}</span>
        <span className={`bike-type-badge ${bikeType}`}>
          {bikeType === 'mechanical' ? 'Mecánica' : 'Eléctrica'}
        </span>
      </span>
    </label>
  );
};
