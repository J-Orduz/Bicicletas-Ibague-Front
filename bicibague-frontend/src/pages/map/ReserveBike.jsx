import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// api
import { useReserveBikeMutation, useReserveBikeScheduledMutation } from '@api/reserves';
// hooks
import { useNotifier } from '@hooks/useNotifier';
//icons
import { BsXLg } from 'react-icons/bs';
// styles
import './ReserveBike.scss';

export const ReserveBike = ({ station, onClose }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const notify = useNotifier();
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
      notify.warn(t('reserves.selectBikeAlert'));
      return;
    }

    // Validar fecha y hora si es reserva programada
    if (reservationType === 'scheduled') {
      if (!scheduledDate || !scheduledTime) {
        notify.warn(t('reserves.selectDateTimeAlert'));
        return;
      }

      // Validar que la fecha sea futura
      const selectedDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      const now = new Date();
      if (selectedDateTime <= now) {
        notify.warn(t('reserves.futureDateAlert'));
        return;
      }
    }

    try {
      if (reservationType === 'now') {
        // Reserva inmediata
        await reserveBikeMutation.post({ bikeId: selectedBike });
        notify.success(t('reserves.reserveSuccessNow', { bikeId: selectedBike, station: station.name }));
      } else {
        // Reserva programada
        // Construir la fecha y hora en formato ISO con zona horaria de Colombia (UTC-5)
        const fechaHoraProgramada = `${scheduledDate}T${scheduledTime}:00-05:00`;

        console.log('Fecha y hora programada:', fechaHoraProgramada);
        await reserveBikeScheduledMutation.post({
          bikeId: selectedBike,
          fechaHoraProgramada: fechaHoraProgramada
        });
        notify.success(t('reserves.reserveSuccessScheduled', { bikeId: selectedBike, date: scheduledDate, time: scheduledTime, station: station.name }));
      }

      onClose();
      navigate('/reserves');
    } catch (error) {
      notify.error(error.errorMutationMsg || error.errorJsonMsg);
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
              <span className="info-label">{t('reserves.totalAvailable')}</span>
              <span className="info-value">
                {availableBikes.length} / {totalCapacity}
              </span>
            </div>
          </div>

          <div className="bike-type-stats">
            <div className="type-stat mechanical">
              <span className="icon">🚴</span>
              <div className="type-info">
                <span className="type-label">{t('reserves.mechanical')}</span>
                <span className="type-count">{availableMechanical.length}</span>
              </div>
            </div>
            <div className="type-stat electric">
              <span className="icon">⚡</span>
              <div className="type-info">
                <span className="type-label">{t('reserves.electric')}</span>
                <span className="type-count">{availableElectric.length}</span>
              </div>
            </div>
          </div>

          {/* Tipo de reserva */}
          <div className="reservation-type">
            <h3>{t('reserves.reservationType')}:</h3>
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
                    <strong>{t('reserves.reserveNow')}</strong>
                    <small>{t('reserves.availableImmediately')}</small>
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
                    <strong>{t('reserves.scheduleReserve')}</strong>
                    <small>{t('reserves.chooseDateTime')}</small>
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
                  {t('reserves.date')}:
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
                  {t('reserves.time')}:
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
            <h3>{t('reserves.selectBike')}:</h3>

            {/* TODO: Simplificar */}
            {availableMechanical.length > 0 && (
              <div className="bike-category">
                <p className="category-title">{t('reserves.mechanical')}</p>
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
                <p className="category-title">{t('reserves.electric')}</p>
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
            {t('common.cancel')}
          </button>
          <button
            className="btn-confirm"
            onClick={handleReserve}
            disabled={!selectedBike}
          >
            {t('reserves.reserveBike')}
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
