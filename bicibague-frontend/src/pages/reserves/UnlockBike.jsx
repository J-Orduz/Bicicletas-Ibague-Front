import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// API
import { useStartTripMutation } from '@api/reserves';
import { useGetStations } from '@api/bikes';
// icons
import { IoLockOpenOutline } from 'react-icons/io5';
import { BsXLg } from 'react-icons/bs';
import { FaBicycle } from 'react-icons/fa6';
import {
  FaExclamationCircle,
  FaMapMarkerAlt,
  FaChevronDown,
} from 'react-icons/fa';
// styles
import './UnlockBike.scss';

export const UnlockBike = ({ reservation, onClose }) => {
  const navigate = useNavigate();

  const [serialNumber, setSerialNumber] = useState('');
  const [destinationSearch, setDestinationSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [stations, setStations] = useState([]);
  const [showStationsList, setShowStationsList] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getStations = useGetStations();

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Obtener estaciones al montar el componente
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const stationsData = await getStations.get();
        setStations(stationsData);
      } catch (error) {
        console.error('Error al obtener estaciones:', error);
      }
    };

    fetchStations();
  }, []);

  // Función para normalizar texto (quitar tildes y convertir a minúsculas)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  };

  // Filtrar estaciones según búsqueda y ordenar por id
  const filteredStations = stations
    .filter((station) => {
      if (!destinationSearch.trim()) return true;
      const normalizedSearch = normalizeText(destinationSearch);
      const normalizedName = normalizeText(station.nombre);
      return normalizedName.includes(normalizedSearch);
    })
    .sort((a, b) => a.id - b.id);

  const onUnlock = (serialNumber, bikeData) => {
    console.log('Viaje iniciado con número de serie:', serialNumber);

    alert(
      `¡Bicicleta desbloqueada! Número de serie: ${serialNumber}\n¡Disfruta tu viaje!`
    );
    navigate('/trips');
  };

  const startTripMutation = useStartTripMutation();

  const handleUnlock = async () => {
    setError('');

    // Validación básica
    if (!serialNumber.trim()) {
      setError('Por favor ingresa el número de serie');
      return;
    }

    if (serialNumber.length < 11 || serialNumber.length > 11) {
      setError('El número de serie debe ser de tipo: ABC-123-XYZ');
      return;
    }

    if (!selectedStation) {
      setError('Por favor selecciona una estación de destino');
      return;
    }

    setIsLoading(true);

    try {
      const response = await startTripMutation.post({
        serialNumber: serialNumber,
        bikeId: reservation.bikeId,
        estacionFin: selectedStation.id,
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
    setError('');
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestinationSearch(value);
    setShowStationsList(true);
    setError('');
  };

  const handleStationSelect = (station) => {
    setSelectedStation(station);
    setDestinationSearch(station.nombre);
    setShowStationsList(false);
    setError('');
  };

  const handleDestinationFocus = () => {
    setShowStationsList(true);
  };

  // detectar clics fuera del componente de la lista de estaciones para cerrarla
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        !e.target.classList.contains('station-item') &&
        !e.target.classList.contains('destination-input') &&
        !e.target.classList.contains('input-label')
      ) {
        setShowStationsList(false);
        // validar si destinationSearch no coincide con la estacion previamente seleccionada para no mostrar nombre incorrecto
        if ( destinationSearch !== selectedStation?.nombre ) {
          setDestinationSearch(selectedStation?.nombre || '');
        }
        
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [destinationSearch, selectedStation]);

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

          <div className="input-section">
            <label htmlFor="destination" className="input-label">
              Estación de Destino:
            </label>
            <div className="input-wrapper autocomplete-wrapper">
              <div className="input-icon-container">
                <FaMapMarkerAlt className="input-icon" />
              </div>
              <input
                type="text"
                id="destination"
                className={`serial-input destination-input ${
                  error && !selectedStation ? 'error' : ''
                }`}
                placeholder="Buscar estación..."
                value={destinationSearch}
                onChange={handleDestinationChange}
                onFocus={handleDestinationFocus}
                disabled={isLoading}
                autoComplete="off"
              />
              <FaChevronDown
                className={`dropdown-icon ${showStationsList ? 'open' : ''}`}
              />

              {showStationsList && filteredStations.length > 0 && (
                <div className="stations-list">
                  {filteredStations.map((station) => (
                    <div
                      key={station.id}
                      className={`station-item ${
                        selectedStation?.id === station.id ? 'selected' : ''
                      }`}
                      onClick={() => handleStationSelect(station)}
                    >
                      <div className="station-info">
                        <span className="station-name">{station.nombre}</span>
                        <span
                          className={`station-type ${station.tipoEstacion.toLowerCase()}`}
                        >
                          {station.tipoEstacion === 'BICICLETA'
                            ? '🚲 Bicicleta'
                            : '🚇 Metro'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showStationsList &&
                filteredStations.length === 0 &&
                destinationSearch && (
                  <div className="stations-list">
                    <div className="station-item no-results">
                      No se encontraron estaciones
                    </div>
                  </div>
                )}
            </div>
            {selectedStation && (
              <div className="selected-station-info">
                <span className="station-type-label">Tipo de estación:</span>
                <span
                  className={`station-type-badge ${selectedStation.tipoEstacion.toLowerCase()}`}
                >
                  {selectedStation.tipoEstacion === 'BICICLETA'
                    ? '🚲 Bicicleta'
                    : '🚇 Metro'}
                </span>
              </div>
            )}
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

          <div className="unlock-instructions">
            <h3 className="instructions-title">
              Instrucciones del numero de serie:
            </h3>
            <ol className="instructions-list">
              <li>
                1. Localiza el número de serie en la barra de la bicicleta
              </li>
              <li>
                2. Ingresa el código exactamente como aparece (sin espacios)
              </li>
            </ol>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button
            className="btn-unlock"
            onClick={handleUnlock}
            disabled={!serialNumber.trim() || !selectedStation || isLoading}
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
