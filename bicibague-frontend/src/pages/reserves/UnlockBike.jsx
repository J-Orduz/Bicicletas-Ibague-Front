import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// API
import { useStartTripMutation } from '@api/reserves';
// icons
import { IoLockOpenOutline } from 'react-icons/io5';
import { BsXLg } from 'react-icons/bs';
import { FaBicycle } from 'react-icons/fa6';
import { FaExclamationCircle } from 'react-icons/fa';
// styles
import './UnlockBike.scss';

export const UnlockBike = ({ reservation, onClose }) => {
  const navigate = useNavigate();

  const [serialNumber, setSerialNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const startTripMutation = useStartTripMutation();

  const onUnlock = (serialNumber, bikeData) => {
    console.log('Viaje iniciado con número de serie:', serialNumber);

    // TEMPORAL: Guardar datos del viaje en localStorage para simular persistencia
    // TODO: Reemplazar con datos reales de la API cuando esté disponible (bikeId, bikeType, status ya son datos reales)

    const tripData = {
      id: reservation.id,
      bikeId: bikeData.id, 
      bikeType: bikeData.tipo, 
      battery: 85, // Valor temporal fijo para bicicletas eléctricas
      startTime: new Date().toISOString(), // Fecha y hora de inicio
      status: bikeData.estado,
      serialNumber: serialNumber,
    };

    localStorage.setItem('currentTrip', JSON.stringify(tripData));

    // TEMPORAL: Eliminar la reserva del localStorage al iniciar el viaje
    localStorage.removeItem('currentReservation');

    alert(
      `¡Bicicleta desbloqueada! Número de serie: ${serialNumber}\n¡Disfruta tu viaje!`
    );
    navigate('/trips');
  };

  const handleUnlock = async () => {
    setError('');

    // Validación básica
    if (!serialNumber.trim()) {
      // cadena vacia es falsy: !"" = true
      setError('Por favor ingresa el número de serie');
      return;
    }

    if (serialNumber.length < 11 || serialNumber.length > 11) {
      setError('El número de serie debe ser de tipo: ABC-123-XYZ');
      return;
    }

    setIsLoading(true);

    try {
      const response = await startTripMutation.post({
        serialNumber: serialNumber,
      });

      console.log('respuesta de iniciar viaje:', response);

      setIsLoading(false);
      onUnlock(serialNumber, response.data.bicicleta);
      onClose();
    } catch (error) {
      setIsLoading(false);
      if (error?.errorStatus === 400) {
        setError(error.errorJsonMsg);
        return;
      }
      setError(error.errorMutationMsg);
      return;
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
    setSerialNumber(value);
    setError(''); // Limpiar error al escribir
  };

  // Cerrar modal al hacer clic en el overlay
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('unlock-modal-overlay') && !isLoading) {
      onClose();
    }
  };

  return (
    <div className="unlock-modal-overlay" onClick={handleOverlayClick}>
      <div className="unlock-modal">
        <div className="modal-header">
          <h1>Desbloquear Bicicleta</h1>
          <button
            className="btn-close"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Cerrar"
          >
            <BsXLg className="btn-icon" />
          </button>
        </div>

        <div className="modal-body">
          <div className="bike-info-card">
            <div className="bike-icon-container">
              <FaBicycle className="bike-icon" />
            </div>
            <div className="bike-details">
              <h2 className="bike-id">{reservation.bikeId}</h2>
              <p className="bike-status">Reserva Activa</p>
            </div>
          </div>

          <div className="unlock-instructions">
            <h3 className="instructions-title">Instrucciones:</h3>
            <ol className="instructions-list">
              <li>
                1. Localiza el número de serie en la barra de la bicicleta
              </li>
              <li>
                2. Ingresa el código exactamente como aparece (sin espacios)
              </li>
              <li>3. Presiona "Desbloquear" para iniciar tu viaje</li>
            </ol>
          </div>

          <div className="input-section">
            <label htmlFor="serialNumber" className="input-label">
              Número de Serie:
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                id="serialNumber"
                className={`serial-input ${error ? 'error' : ''}`}
                placeholder="Ej: ABC-123-XYZ"
                value={serialNumber}
                onChange={handleInputChange}
                disabled={isLoading}
                autoFocus
                maxLength={20}
              />
            </div>
            {error && (
              <div className="error-message">
                <FaExclamationCircle className="error-icon" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button
            className="btn-unlock"
            onClick={handleUnlock}
            disabled={!serialNumber.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Desbloqueando...
              </>
            ) : (
              <>
                <IoLockOpenOutline className="btn-icon" />
                Desbloquear
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
