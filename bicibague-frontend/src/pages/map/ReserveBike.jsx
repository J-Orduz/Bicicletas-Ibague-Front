import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
//icons
import { BsXLg } from 'react-icons/bs';
// styles
import './ReserveBike.scss';

export const ReserveBike = ({ station, onClose }) => {
  const navigate = useNavigate();
  const [selectedBike, setSelectedBike] = useState(null);

  const totalCapacity = 15;
  const availableBikes = station.bikes.filter((bike) => bike.available);
  const availableMechanical = station.bikes.filter(
    (bike) => bike.type === 'mechanical' && bike.available
  );
  const availableElectric = station.bikes.filter(
    (bike) => bike.type === 'electric' && bike.available
  );

  const handleReserve = () => {
    if (selectedBike) {
      alert(
        `Bicicleta ${selectedBike} reservada exitosamente en ${station.name}!`
      );
      onClose();
      navigate('/reserves');
    } else {
      alert('Por favor selecciona una bicicleta');
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
