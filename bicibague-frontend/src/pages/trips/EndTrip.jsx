import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// components
import { StripePayment, StripePaymentForm } from '@components/StripePayment';
// API
import { useCreatePaymentIntentMutation } from '@api/payments';
// hooks
import { useCurrency } from '@hooks/useCurrency';
// icons
import { BsXLg } from 'react-icons/bs';
import { FaBicycle, FaRegClock, FaMoneyBillWave } from 'react-icons/fa6';
import { FaCreditCard } from 'react-icons/fa';
// styles
import './EndTrip.scss';

export const EndTrip = ({ trip, onClose, onTripEnded }) => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('summary'); // 'summary', 'payment', 'processing', 'success'
  const [tripCost, setTripCost] = useState(0);
  const [clientSecret, setClientSecret] = useState('');

  const createPaymentIntentMutation = useCreatePaymentIntentMutation();

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Calcular costo del viaje
  useEffect(() => {
    if (trip) {
      const start = new Date(trip.startTime);
      const now = new Date();
      const diffInMinutes = Math.floor((now - start) / (1000 * 60));

      // Tarifa base: 500 COP por minuto
      // Convertir minutos a horas y calcular costo (en centavos de COP)
      const costInCents = Math.ceil(diffInMinutes * 500);
      setTripCost(costInCents <= 2500 ? 2500 : costInCents);
    }
  }, [trip]);

  const calculateDuration = () => {
    if (!trip) return '00:00';
    const start = new Date(trip.startTime);
    const now = new Date();
    const diff = now - start;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    try {
      // Crear PaymentIntent en el backend
      const paymentIntentData = {
        amount: tripCost,
        currency: 'cop',
        metadata: {
          bookingId: 'abc1234',
          tipo: 'viaje',
        },
      };

      const response = await createPaymentIntentMutation.post(
        paymentIntentData
      );

      if (response?.paymentIntent?.client_secret) {
        setClientSecret(response.paymentIntent.client_secret);
        setPaymentStep('payment');
      } else {
        alert('Error al crear el pago');
      }
    } catch (error) {
      console.error('Error al crear el PaymentIntent:', error);
      alert(error.errorMutationMsg || 'Error al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    setPaymentStep('success');
    setTimeout(() => {
      // TEMPORAL: Guardar el viaje finalizado en el historial de localStorage
      const completedTrip = {
        id: Date.now(),
        bikeId: trip.bikeId,
        bikeType: trip.bikeType,
        startTime: trip.startTime,
        endTime: new Date().toISOString(),
        duration: calculateDuration(),
        charge: tripCost,
      };

      // Obtener historial existente o crear uno nuevo
      const existingHistory = JSON.parse(
        localStorage.getItem('tripHistory') || '[]'
      );

      // Agregar el viaje completado al inicio del historial
      const updatedHistory = [completedTrip, ...existingHistory];

      // Guardar el historial actualizado
      localStorage.setItem('tripHistory', JSON.stringify(updatedHistory));

      // Limpiar el viaje actual del localStorage
      localStorage.removeItem('currentTrip');
      onTripEnded();
      onClose();
      navigate('/trips');
    }, 2000);
  };

  // Hook del componente Stripe reutilizable (siempre llamado, pero solo activo cuando enabled es true)
  const stripePayment = StripePayment({
    clientSecret,
    onSuccess: handlePaymentSuccess,
    onError: (errorMsg) => {
      console.error('Error en el pago:', errorMsg);
    },
    isLoading,
    setIsLoading,
    enabled: paymentStep === 'payment', // Solo inicializar cuando esté en el paso de pago
  });

  const handlePayment = async () => {
    if (stripePayment.isReady) {
      await stripePayment.handlePayment();
    }
  };

  const handleCancel = () => {
    if (paymentStep === 'processing') return;
    onClose();
  };

  // Cerrar modal al hacer clic en el overlay
  const handleOverlayClick = (e) => {
    if (
      e.target.classList.contains('endtrip-modal-overlay') &&
      !isLoading &&
      paymentStep !== 'processing'
    ) {
      handleCancel();
    }
  };

  return (
    <div className="endtrip-modal-overlay" onClick={handleOverlayClick}>
      <div className="endtrip-modal">
        <div className="modal-header">
          <h1>
            {paymentStep === 'summary' && 'Resumen del Viaje'}
            {paymentStep === 'payment' && 'Procesar Pago'}
            {paymentStep === 'processing' && 'Procesando...'}
            {paymentStep === 'success' && '¡Pago Exitoso!'}
          </h1>
          <button
            className="btn-close"
            onClick={handleCancel}
            disabled={isLoading || paymentStep === 'processing'}
            aria-label="Cerrar"
          >
            <BsXLg className="btn-icon" />
          </button>
        </div>

        <div className="modal-body">
          {/* Resumen del viaje */}
          {paymentStep === 'summary' && (
            <>
              <div className="bike-info-card">
                <div className="bike-icon-container">
                  <FaBicycle className="bike-icon" />
                </div>
                <div className="bike-details">
                  <h2 className="bike-id">{trip.bikeId}</h2>
                  <p className="bike-status">Viaje Completado</p>
                </div>
              </div>

              <div className="trip-summary">
                <h3 className="summary-title">Detalles del Viaje</h3>
                <div className="summary-item">
                  <div className="summary-label">
                    <FaRegClock className="summary-icon" />
                    <span>Duración</span>
                  </div>
                  <span className="summary-value">{calculateDuration()}</span>
                </div>
                <div className="summary-item total">
                  <div className="summary-label">
                    <FaMoneyBillWave className="summary-icon" />
                    <span>Total a pagar</span>
                  </div>
                  <span className="summary-value">
                    {formatCurrency(tripCost)}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Formulario de pago */}
          {paymentStep === 'payment' && (
            <>
              <div className="payment-amount">
                <span className="amount-label">Total a pagar:</span>
                <span className="amount-value">{formatCurrency(tripCost)}</span>
              </div>

              <StripePaymentForm error={stripePayment.error} />
            </>
          )}

          {/* Procesando */}
          {paymentStep === 'processing' && (
            <div className="processing-container">
              <div className="spinner-large"></div>
              <p className="processing-text">Procesando tu pago...</p>
              <p className="processing-subtext">Por favor espera un momento</p>
            </div>
          )}

          {/* Éxito */}
          {paymentStep === 'success' && (
            <div className="success-container">
              <div className="success-icon-wrapper">
                <svg
                  className="success-icon"
                  viewBox="0 0 52 52"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="success-circle"
                    cx="26"
                    cy="26"
                    r="25"
                    fill="none"
                  />
                  <path
                    className="success-check"
                    fill="none"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                  />
                </svg>
              </div>
              <h2 className="success-title">¡Pago realizado con éxito!</h2>
              <p className="success-text">
                Tu viaje ha sido finalizado. Gracias por usar nuestro servicio.
              </p>
            </div>
          )}
        </div>

        {paymentStep !== 'processing' && paymentStep !== 'success' && (
          <div className="modal-footer">
            <button
              className="btn-cancel"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </button>
            {paymentStep === 'summary' && (
              <button
                className="btn-proceed"
                onClick={handleProceedToPayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Cargando...
                  </>
                ) : (
                  'Proceder al Pago'
                )}
              </button>
            )}
            {paymentStep === 'payment' && (
              <button
                className="btn-pay"
                onClick={handlePayment}
                disabled={isLoading || !stripePayment.isReady}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <FaCreditCard className="btn-icon" />
                    Pagar {formatCurrency(tripCost)}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
