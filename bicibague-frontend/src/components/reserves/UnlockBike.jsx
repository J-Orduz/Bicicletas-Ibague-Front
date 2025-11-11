import { useState, useEffect } from 'react';
// icons
import { IoLockOpenOutline } from 'react-icons/io5';
import { BsXLg  } from "react-icons/bs";
import { MdOutlineDirectionsBike } from 'react-icons/md';
import {
  FaExclamationCircle,
} from 'react-icons/fa';
// styles
import './UnlockBike.scss';

export const UnlockBike = ({ reservation, onClose, onUnlock }) => {
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

  const handleUnlock = async () => {
    setError('');

    // Validación básica
    if (!serialNumber.trim()) {
      setError('Por favor ingresa el número de serie');
      return;
    }

    if (serialNumber.length < 4) {
      setError('El número de serie debe tener al menos 4 caracteres');
      return;
    }

    setIsLoading(true);

    // Simular petición a la API
    setTimeout(() => {
      // TODO: Aquí implementar la llamada real a la API
      console.log('Desbloqueando bicicleta:', {
        reservationId: reservation.id,
        bikeId: reservation.bikeId,
        serialNumber: serialNumber,
      });

      // Simulación: validar si el número de serie es correcto
      // En producción, esto vendría del backend
      if (serialNumber.toLowerCase() === 'test123') {
        setIsLoading(false);
        onUnlock(serialNumber);
        onClose();
      } else {
        setIsLoading(false);
        setError('Número de serie incorrecto. Intenta nuevamente.');
      }
    }, 500);
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
            <BsXLg  className='btn-icon'/>
          </button>
        </div>

        <div className="modal-body">
          <div className="bike-info-card">
            <div className="bike-icon-container">
              <MdOutlineDirectionsBike className="bike-icon" />
            </div>
            <div className="bike-details">
              <h2 className="bike-id">{reservation.bikeId}</h2>
              <p className="bike-status">Reserva Activa</p>
            </div>
          </div>

          <div className="unlock-instructions">
            <h3 className="instructions-title">Instrucciones:</h3>
            <ol className="instructions-list">
              <li>1. Localiza el número de serie en la barra de la bicicleta</li>
              <li>2. Ingresa el código exactamente como aparece (sin espacios)</li>
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
