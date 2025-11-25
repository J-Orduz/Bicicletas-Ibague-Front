import { useState, useEffect } from 'react';
// components
import { StripePayment, StripePaymentForm } from '@components/StripePayment';
// hooks
import { useCurrency } from '@hooks/useCurrency';
// icons
import { BsXLg, BsStarFill, BsCheckCircleFill } from 'react-icons/bs';
import { FaCreditCard } from 'react-icons/fa';
// styles
import './SubscriptionPaymentModal.scss';

export const SubscriptionPaymentModal = ({ onClose, onSuccess, createSubscription }) => {
  const { formatCurrency } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('summary'); // 'summary', 'payment', 'success'
  const [clientSecret, setClientSecret] = useState('');

  const SUBSCRIPTION_AMOUNT = 150000; // $150.000 COP

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    try {
      // Llamar a la API para crear el PaymentIntent de la suscripción
      const response = await createSubscription.post();
      
      if (response?.paymentIntent?.client_secret) {
        setClientSecret(response.paymentIntent.client_secret);
        setPaymentStep('payment');
      } else {
        alert('Error al crear el pago de suscripción');
      }
    } catch (error) {
      console.error('Error al crear el PaymentIntent:', error);
      alert(error.errorMutationMsg || 'Error al procesar la suscripción');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    setPaymentStep('success');
    setTimeout(() => {
      onSuccess?.();
      onClose();
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
    if (isLoading) return;
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (
      e.target.classList.contains('subscription-payment-modal-overlay') &&
      !isLoading
    ) {
      handleCancel();
    }
  };

  return (
    <div className="subscription-payment-modal-overlay" onClick={handleOverlayClick}>
      <div className="subscription-payment-modal">
        <div className="modal-header">
          <h1>
            {paymentStep === 'summary' && 'Suscripción BicIbagué Plus'}
            {paymentStep === 'payment' && 'Procesar Pago'}
            {paymentStep === 'success' && '¡Suscripción Exitosa!'}
          </h1>
          <button
            className="btn-close"
            onClick={handleCancel}
            disabled={isLoading}
            aria-label="Cerrar"
          >
            <BsXLg className="btn-icon" />
          </button>
        </div>

        <div className="modal-body">
          {/* Resumen de la suscripción */}
          {paymentStep === 'summary' && (
            <>
              <div className="subscription-info-card">
                <div className="subscription-icon-container">
                  <BsStarFill className="subscription-icon" />
                </div>
                <div className="subscription-details">
                  <h2 className="subscription-name">BicIbagué Plus</h2>
                  <p className="subscription-price">
                    {formatCurrency(SUBSCRIPTION_AMOUNT)}/mes
                  </p>
                </div>
              </div>

              <div className="subscription-benefits-card">
                <h3 className="benefits-title">Beneficios incluidos:</h3>
                <ul className="benefits-list">
                  <li>
                    <BsCheckCircleFill className="benefit-icon" />
                    <span>50 viajes disponibles al mes</span>
                  </li>
                  <li>
                    <BsCheckCircleFill className="benefit-icon" />
                    <span>Sin recargos por exceder el tiempo límite</span>
                  </li>
                </ul>
              </div>

              <div className="subscription-total">
                <span className="total-label">Total a pagar hoy:</span>
                <span className="total-value">
                  {formatCurrency(SUBSCRIPTION_AMOUNT)}
                </span>
              </div>
            </>
          )}

          {/* Formulario de pago */}
          {paymentStep === 'payment' && (
            <>
              <div className="payment-amount">
                <span className="amount-label">Total a pagar:</span>
                <span className="amount-value">
                  {formatCurrency(SUBSCRIPTION_AMOUNT)}
                </span>
              </div>

              <StripePaymentForm error={stripePayment.error} />
            </>
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
              <h2 className="success-title">¡Suscripción activada!</h2>
              <p className="success-text">
                Ahora tienes acceso a todos los beneficios de BicIbagué Plus.
              </p>
            </div>
          )}
        </div>

        {paymentStep !== 'success' && (
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
                    Pagar {formatCurrency(SUBSCRIPTION_AMOUNT)}
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
