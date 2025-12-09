import { useState, useEffect } from 'react';
// API
import {
  useCreatePaymentIntentMutation,
  useGetStripePublishableKey,
} from '@api/payments';
// icons
import { FaExclamationCircle, FaCreditCard } from 'react-icons/fa';
// styles
import './stripePayment.scss';

/**
 * Componente reutilizable para procesar pagos con Stripe
 * @param {string} clientSecret - Client secret del PaymentIntent
 * @param {function} onSuccess - Callback cuando el pago es exitoso
 * @param {function} onError - Callback cuando hay un error
 * @param {boolean} isLoading - Estado de carga externo
 * @param {function} setIsLoading - Función para actualizar estado de carga externo
 * @param {boolean} enabled - Si el hook debe inicializarse (default: true)
 */
export const StripePayment = ({
  clientSecret,
  onSuccess,
  onError,
  isLoading = false,
  setIsLoading,
  enabled = true,
}) => {
  const [error, setError] = useState('');
  const [stripe, setStripe] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const getStripeKey = useGetStripePublishableKey();

  // Inicializar Stripe
  useEffect(() => {
    if (!enabled) return;

    const initializeStripe = async () => {
      try {
        const response = await getStripeKey.get();
        const publishableKey = response.publishableKey;

        if (window.Stripe) {
          const stripeInstance = window.Stripe(publishableKey);
          setStripe(stripeInstance);
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
  }, [enabled]);

  // Montar el elemento de tarjeta
  useEffect(() => {
    const setupCardElement = async () => {
      if (!stripe || !clientSecret || isInitialized || !enabled) return;

      setIsLoading?.(true);
      try {
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

            setIsInitialized(true);
          }
          setIsLoading?.(false);
        }, 100);
      } catch (error) {
        setIsLoading?.(false);
        const errorMsg = error.errorMutationMsg || 'Error al procesar el pago';
        setError(errorMsg);
        onError?.(errorMsg);
      }
    };

    setupCardElement();
  }, [stripe, clientSecret, enabled]);

  // Procesar el pago
  const handlePayment = async () => {
    if (!stripe || !cardElement) {
      const errorMsg = 'El sistema de pagos no está listo';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading?.(true);
    setError('');

    try {
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        });

      if (stripeError) {
        setError(stripeError.message);
        setIsLoading?.(false);
        onError?.(stripeError.message);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        setIsLoading?.(false);
        onSuccess?.(paymentIntent);
      }
    } catch (error) {
      setIsLoading?.(false);
      const errorMsg = 'Error al procesar el pago. Intenta nuevamente.';
      setError(errorMsg);
      onError?.(errorMsg);
    }
  };

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (cardElement) {
        cardElement.unmount();
      }
    };
  }, [cardElement]);

  return {
    handlePayment,
    error,
    isReady: isInitialized && !isLoading,
  };
};

/**
 * Componente visual del formulario de pago con Stripe
 */
export const StripePaymentForm = ({ error }) => {
  return (
    <div className="stripe-payment-form">
      <label className="payment-label">
        <FaCreditCard className="payment-icon" />
        Información de la tarjeta
      </label>
      <div id="card-element" className="card-element"></div>

      {error && (
        <div className="error-message">
          <FaExclamationCircle className="error-icon" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
