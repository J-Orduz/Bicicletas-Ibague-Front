import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// API
import {
  useCreatePaymentIntentMutation,
  useGetStripePublishableKey,
} from '@api/payments';
// hooks
import { useCurrency } from '@hooks/useCurrency';
// icons
import { MdOutlineStopCircle } from 'react-icons/md';
import { BsXLg } from 'react-icons/bs';
import { FaBicycle, FaRegClock, FaMoneyBillWave } from 'react-icons/fa6';
import { FaExclamationCircle, FaCreditCard } from 'react-icons/fa';
// styles
import './EndTrip.scss';

export const EndTrip = ({ trip, onClose, onTripEnded }) => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('summary'); // 'summary', 'payment', 'processing', 'success'
  const [tripCost, setTripCost] = useState(0);
  const [stripe, setStripe] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  const createPaymentIntentMutation = useCreatePaymentIntentMutation();
  const getStripeKey = useGetStripePublishableKey();

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Inicializar Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      try {
        const response = await getStripeKey.get();
        const publishableKey = response.publishableKey;
        console.log('Clave pública de Stripe obtenida:', publishableKey);

        if (window.Stripe) {
          const stripeInstance = window.Stripe(publishableKey);
          setStripe(stripeInstance);
          console.log('Stripe inicializado:', stripeInstance);
        } else {
          setError(
            'Error al cargar Stripe. Por favor recarga la página e intenta nuevamente.'
          );
        }
      } catch (error) {
        console.error('Error al obtener la clave de Stripe:', error);
        setError('Error al inicializar el sistema de pagos');
      }
    };

    initializeStripe();
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
      setTripCost(costInCents <= 2000 ? 2000 : costInCents);
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
    setError('');
    setIsLoading(true);
    setPaymentStep('payment');

    try {
      // Crear PaymentIntent en el backend
      const paymentIntentData = {
        amount: tripCost,
        currency: 'cop',
        metadata: {
          bookingId: 'abc1234',
        },
      };
      console.log('Datos para PaymentIntent:', paymentIntentData);
      const response = await createPaymentIntentMutation.post(
        paymentIntentData
      );

      setClientSecret(response.paymentIntent.client_secret);

      // Montar Stripe Elements
      setTimeout(() => {
        if (stripe) {
          const elements = stripe.elements();
          const card = elements.create('card', {
            style: {
              base: {
                fontSize: '16px',
                color: getComputedStyle(document.documentElement)
                  .getPropertyValue('--text-primary')
                  .trim(),
                '::placeholder': {
                  color: getComputedStyle(document.documentElement)
                    .getPropertyValue('--text-secondary')
                    .trim(),
                },
              },
            },
          });

          card.mount('#card-element');
          setCardElement(card);

          card.on('change', (event) => {
            if (event.error) {
              setError(event.error.message);
            } else {
              setError('');
            }
          });
        }
        setIsLoading(false);
      }, 100);
    } catch (error) {
      setIsLoading(false);
      setPaymentStep('summary');
      setError(error.errorMutationMsg || 'Error al procesar el pago');
    }
  };

  const handlePayment = async () => {
    if (!stripe || !cardElement) {
      setError('El sistema de pagos no está listo');
      return;
    }

    setIsLoading(true);
    setError('');
    // setPaymentStep('processing');

    try {
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      console.log('Resultado de confirmCardPayment:', {
        stripeError,
        paymentIntent,
      });

      if (stripeError) {
        setError(stripeError.message);
        setPaymentStep('payment');
        setIsLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
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
      }
    } catch (error) {
      setIsLoading(false);
      setPaymentStep('payment');
      setError('Error al procesar el pago. Intenta nuevamente.');
    }
  };

  const handleCancel = () => {
    if (paymentStep === 'processing') return;
    if (cardElement) {
      cardElement.unmount();
    }
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

              <div className="payment-form">
                <label className="payment-label">
                  <FaCreditCard className="payment-icon" />
                  Información de la tarjeta
                </label>
                <div id="card-element" className="card-element"></div>
              </div>

              {error && (
                <div className="error-message">
                  <FaExclamationCircle className="error-icon" />
                  <span>{error}</span>
                </div>
              )}
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
                  <>
                    {/* <MdOutlineStopCircle className="btn-icon" /> */}
                    Proceder al Pago
                  </>
                )}
              </button>
            )}
            {paymentStep === 'payment' && (
              <button
                className="btn-pay"
                onClick={handlePayment}
                disabled={isLoading}
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
