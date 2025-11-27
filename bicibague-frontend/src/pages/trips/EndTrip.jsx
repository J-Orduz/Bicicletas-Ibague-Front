import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// components
import { StripePayment, StripePaymentForm } from '@components/StripePayment';
// API
import { 
  useCreatePaymentIntentMutation, 
  usePayWithCityPassMutation,
  usePayWithBalanceMutation,
  useGetCurrentBalance,
  useGetCityPassBalance,
  useGetSubscription 
} from '@api/payments';
// hooks
import { useCurrency } from '@hooks/useCurrency';
// icons
import { BsXLg, BsStarFill } from 'react-icons/bs';
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
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'citypass', or 'balance'
  const [cityPassError, setCityPassError] = useState('');
  const [balanceError, setBalanceError] = useState('');
  const [userBalance, setUserBalance] = useState(null);
  const [cityPassBalance, setCityPassBalance] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);

  const createPaymentIntentMutation = useCreatePaymentIntentMutation();
  const payWithCityPassMutation = usePayWithCityPassMutation();
  const payWithBalanceMutation = usePayWithBalanceMutation();
  const getCurrentBalance = useGetCurrentBalance();
  const getCityPassBalance = useGetCityPassBalance();
  const getSubscription = useGetSubscription();

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Verificar suscripción al abrir el modal
  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const subData = await getSubscription.get();
      setSubscriptionData(subData);
    } catch (error) {
      console.error('Error al verificar suscripción:', error);
    } finally {
      setIsCheckingSubscription(false);
    }
  };

  // Calcular costo del viaje
  useEffect(() => {
    if (trip) {
      const start = new Date(trip.fecha_inicio);
      const now = new Date();
      const diffInMinutes = Math.floor((now - start) / (1000 * 60));

      // Determinar tipo de viaje y calcular costo
      const basePrice = trip.tipo_viaje === 'MILLA' ? 17500 : 25000;
      const maxMinutes = trip.tipo_viaje === 'MILLA' ? 45 : 75;
      const extraMinutePrice = trip.tipo_viaje === 'MILLA' ? 250 : 1000;

      if (diffInMinutes <= maxMinutes) {
        setTripCost(basePrice);
      } else {
        const extraMinutes = diffInMinutes - maxMinutes;
        setTripCost(basePrice + (extraMinutes * extraMinutePrice));
      }
    }
  }, [trip]);

  // Obtener saldos cuando se llega al paso de pago
  useEffect(() => {
    if (paymentStep === 'payment') {
      fetchBalances();
    }
  }, [paymentStep]);

  const fetchBalances = async () => {
    try {
      const balanceData = await getCurrentBalance.get();
      setUserBalance(balanceData.usuario.saldo);
    } catch (error) {
      console.error('Error al obtener saldo:', error);
    }

    try {
      const cityPassData = await getCityPassBalance.get();
      setCityPassBalance(cityPassData.data.tarjeta.saldo);
    } catch (error) {
      // Si no tiene tarjeta vinculada, establecer como null
      setCityPassBalance(null);
    }
  };

  const calculateDuration = () => {
    if (!trip) return '00:00';
    const start = new Date(trip.fecha_inicio);
    const now = new Date();
    const diff = now - start;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    setCityPassError('');
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

  const handlePayWithCityPass = async () => {
    setIsLoading(true);
    setCityPassError('');
    try {
      const response = await payWithCityPassMutation.post({ monto: tripCost });
      
      if (response?.success) {
        console.log('Pago con CityPass exitoso:', response);
        // Pago exitoso, proceder a finalizar el viaje
        setPaymentStep('success');
        setTimeout(() => {
          onTripEnded();
          onClose();
          navigate('/trips');
        }, 2000);
      }
    } catch (error) {
      console.error('Error al pagar con CityPass:', error);
      const errorMsg = error.errorJsonMsg;
      
      // Verificar si es error de tarjeta no vinculada o saldo insuficiente
      if (errorMsg.includes('No tienes una tarjeta')) {
        setCityPassError('no_card');
      } else if (errorMsg.includes('Saldo insuficiente')) {
        setCityPassError('insufficient_balance');
      } else {
        setCityPassError('generic');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayWithBalance = async () => {
    setIsLoading(true);
    setBalanceError('');
    try {
      const response = await payWithBalanceMutation.post({ monto: tripCost });
      
      if (response?.success) {
        console.log('Pago con saldo exitoso:', response);
        // Pago exitoso, proceder a finalizar el viaje
        setPaymentStep('success');
        setTimeout(() => {
          onTripEnded();
          onClose();
          navigate('/trips');
        }, 2000);
      }
    } catch (error) {
      console.error('Error al pagar con saldo:', error);
      const errorMsg = error.errorJsonMsg;
      
      // Verificar si es error de saldo insuficiente
      if (errorMsg.includes('Saldo insuficiente')) {
        setBalanceError('insufficient_balance');
      } else {
        setBalanceError('generic');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Pago exitoso con tarjeta:', stripePayment);
    console.log('Pago exitoso con tarjeta:', stripePayment.paymentMethodDetails);
    setPaymentStep('success');
    setTimeout(() => {
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
                  <h2 className="bike-id">{trip.bicicleta.id}</h2>
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
                
                {subscriptionData?.tiene_suscripcion && subscriptionData?.viajes_disponibles > 0 ? (
                  <div className="summary-item subscription">
                    <div className="summary-label">
                      <BsStarFill className="summary-icon" />
                      <span>Suscripción Activa</span>
                    </div>
                    <span className="summary-value">Gratis</span>
                  </div>
                ) : (
                  <div className="summary-item total">
                    <div className="summary-label">
                      <FaMoneyBillWave className="summary-icon" />
                      <span>Total a pagar</span>
                    </div>
                    <span className="summary-value">
                      {formatCurrency(tripCost)}
                    </span>
                  </div>
                )}
              </div>

              {subscriptionData?.tiene_suscripcion && subscriptionData?.viajes_disponibles > 0 && (
                <div className="subscription-info-box">
                  <div className="info-icon">
                    <BsStarFill />
                  </div>
                  <div className="info-content">
                    <p className="info-title">¡Viaje incluido en tu suscripción!</p>
                    <p className="info-description">
                      Este viaje será descontado de tus {subscriptionData.viajes_disponibles} viajes disponibles.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Formulario de pago */}
          {paymentStep === 'payment' && (
            <>
              <div className="payment-amount">
                <span className="amount-label">Total a pagar:</span>
                <span className="amount-value">{formatCurrency(tripCost)}</span>
              </div>

              {/* Selector de método de pago */}
              <div className="payment-method-selector">
                <h3 className="selector-title">Selecciona el método de pago:</h3>
                <div className="payment-methods">
                  <button
                    className={`payment-method-option ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => {
                      setPaymentMethod('card');
                      setCityPassError('');
                      setBalanceError('');
                    }}
                    disabled={isLoading}
                  >
                    <FaCreditCard className="method-icon" />
                    <span>Tarjeta de Crédito/Débito</span>
                  </button>
                  <button
                    className={`payment-method-option ${paymentMethod === 'balance' ? 'active' : ''}`}
                    onClick={() => {
                      setPaymentMethod('balance');
                      setCityPassError('');
                      setBalanceError('');
                    }}
                    disabled={isLoading}
                  >
                    <FaMoneyBillWave className="method-icon" />
                    <span>Saldo BiciBague</span>
                  </button>
                  <button
                    className={`payment-method-option ${paymentMethod === 'citypass' ? 'active' : ''}`}
                    onClick={() => {
                      setPaymentMethod('citypass');
                      setCityPassError('');
                      setBalanceError('');
                    }}
                    disabled={isLoading}
                  >
                    <FaCreditCard className="method-icon" />
                    <span>CityPass</span>
                  </button>
                </div>
              </div>

              {/* Formulario Stripe (siempre montado pero oculto cuando no está activo) */}
              <div style={{ display: paymentMethod === 'card' ? 'block' : 'none' }}>
                <StripePaymentForm error={stripePayment.error} />
              </div>

              {/* Mensaje Saldo BiciBague */}
              {paymentMethod === 'balance' && (
                <div className="citypass-payment-info">
                  <p className="info-text">
                    El monto será descontado de tu saldo BiciBague.
                  </p>
                  {userBalance !== null && (
                    <div className="balance-display">
                      <span className="balance-label">Tu saldo actual:</span>
                      <span className="balance-value">{formatCurrency(userBalance)}</span>
                    </div>
                  )}
                  {balanceError === 'insufficient_balance' && (
                    <div className="error-container">
                      <p className="error-text">Saldo insuficiente en tu cuenta BiciBague</p>
                      <p className="error-hint">Por favor, selecciona otro método de pago o recarga tu saldo</p>
                    </div>
                  )}
                  {balanceError === 'generic' && (
                    <div className="error-container">
                      <p className="error-text">Error al procesar el pago con saldo</p>
                    </div>
                  )}
                </div>
              )}

              {/* Mensaje CityPass */}
              {paymentMethod === 'citypass' && (
                <div className="citypass-payment-info">
                  <p className="info-text">
                    El monto será descontado de tu tarjeta CityPass vinculada.
                  </p>
                  {cityPassBalance !== null && (
                    <div className="balance-display">
                      <span className="balance-label">Tu saldo CityPass:</span>
                      <span className="balance-value">{formatCurrency(cityPassBalance)}</span>
                    </div>
                  )}
                  {cityPassError === 'no_card' && (
                    <div className="error-container">
                      <p className="error-text">No tienes una tarjeta CityPass vinculada</p>
                      <Link to="/profile" className="link-card-button">
                        Vincular Tarjeta Ahora
                      </Link>
                    </div>
                  )}
                  {cityPassError === 'insufficient_balance' && (
                    <div className="error-container">
                      <p className="error-text">Saldo insuficiente en tu tarjeta CityPass</p>
                      <p className="error-hint">Por favor, selecciona otro método de pago</p>
                    </div>
                  )}
                  {cityPassError === 'generic' && (
                    <div className="error-container">
                      <p className="error-text">Error al procesar el pago con CityPass</p>
                    </div>
                  )}
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
              <h2 className="success-title">
                {subscriptionData?.tiene_suscripcion && subscriptionData?.viajes_disponibles > 0
                  ? '¡Viaje completado!'
                  : '¡Pago realizado con éxito!'}
              </h2>
              <p className="success-text">
                {subscriptionData?.tiene_suscripcion && subscriptionData?.viajes_disponibles > 0
                  ? `Este viaje fue descontado de tu suscripción. Te quedan ${subscriptionData.viajes_disponibles - 1} viajes disponibles este mes.`
                  : 'Tu viaje ha sido finalizado. Gracias por usar nuestro servicio.'}
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
                onClick={
                  subscriptionData?.tiene_suscripcion && subscriptionData?.viajes_disponibles > 0
                    ? () => {
                        setPaymentStep('success');
                        setTimeout(() => {
                          onTripEnded();
                          onClose();
                          navigate('/trips');
                        }, 2000);
                      }
                    : handleProceedToPayment
                }
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Cargando...
                  </>
                ) : subscriptionData?.tiene_suscripcion && subscriptionData?.viajes_disponibles > 0 ? (
                  'Finalizar Viaje'
                ) : (
                  'Proceder al Pago'
                )}
              </button>
            )}
            {paymentStep === 'payment' && (
              <button
                className="btn-pay"
                onClick={
                  paymentMethod === 'card' 
                    ? handlePayment 
                    : paymentMethod === 'citypass' 
                      ? handlePayWithCityPass 
                      : handlePayWithBalance
                }
                disabled={
                  isLoading || 
                  (paymentMethod === 'card' && !stripePayment.isReady)
                }
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    {paymentMethod === 'card' || paymentMethod === 'citypass' ? (
                      <FaCreditCard className="btn-icon" />
                    ) : (
                      <FaMoneyBillWave className="btn-icon" />
                    )}
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
