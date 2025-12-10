import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// components
import { StripePayment, StripePaymentForm } from '@components/StripePayment';
// API
import { 
  useCreatePaymentIntentMutation, 
  usePayWithCityPassMutation,
  usePayWithBalanceMutation,
  useGetCurrentBalance,
  useGetCityPassBalance,
  useGetSubscription,
  useGetPoints,
  useRedeemPointsMutation
} from '@api/payments';
import { useSuccessfulPaymentMutation } from '@api/trips';
// hooks
import { useCurrency } from '@hooks/useCurrency';
import { useNotifier } from '@hooks/useNotifier';
// icons
import { BsXLg, BsStarFill } from 'react-icons/bs';
import { FaBicycle, FaRegClock, FaMoneyBillWave } from 'react-icons/fa6';
import { FaCreditCard } from 'react-icons/fa';
// styles
import './EndTrip.scss';

export const EndTrip = ({ trip, tripEndData, onClose, onTripEnded }) => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { t } = useTranslation();
  const notify = useNotifier();

  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState('summary'); // 'summary', 'payment', 'processing', 'success'
  const [clientSecret, setClientSecret] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card'); // 'card', 'citypass', or 'balance'
  const [cityPassError, setCityPassError] = useState('');
  const [balanceError, setBalanceError] = useState('');
  const [userBalance, setUserBalance] = useState(null);
  const [cityPassBalance, setCityPassBalance] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [pointsData, setPointsData] = useState(null);
  const [isRedeemingPoints, setIsRedeemingPoints] = useState(false);
  const [pointsRedeemed, setPointsRedeemed] = useState(false);
  const [discountedPrice, setDiscountedPrice] = useState(null);

  const createPaymentIntentMutation = useCreatePaymentIntentMutation();
  const payWithCityPassMutation = usePayWithCityPassMutation();
  const payWithBalanceMutation = usePayWithBalanceMutation();
  const getCurrentBalance = useGetCurrentBalance();
  const getCityPassBalance = useGetCityPassBalance();
  const getSubscription = useGetSubscription();
  const getPoints = useGetPoints();
  const redeemPointsMutation = useRedeemPointsMutation();
  const successfulPaymentMutation = useSuccessfulPaymentMutation();

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Verificar suscripción y obtener puntos al abrir el modal
  useEffect(() => {
    checkSubscription();
    fetchPoints();
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

  const fetchPoints = async () => {
    try {
      const points = await getPoints.get();
      setPointsData(points.data);
    } catch (error) {
      console.error('Error al obtener puntos:', error);
    }
  };

  // Calcular puntos canjeables (múltiplo de 10)
  const getRedeemablePoints = () => {
    if (!pointsData || !pointsData.puntos) return 0;
    return Math.floor(pointsData.puntos / 10) * 10;
  };

  // Calcular descuento en pesos
  const getDiscountAmount = () => {
    return getRedeemablePoints() * 100;
  };

  // Verificar si ya se canjearon puntos para este viaje
  const hasPointsRedeemed = () => {
    console.log(tripEndData)
    return tripEndData?.precioDescuento && tripEndData.precioDescuento > 0;
  };

  // Manejar canje de puntos
  const handleRedeemPoints = async () => {
    if (!tripEndData?.id || isRedeemingPoints) return;
    
    setIsRedeemingPoints(true);
    try {
      const response = await redeemPointsMutation.post({ viajeId: tripEndData.id });
      
      if (response?.success && response?.data) {
        // Actualizar el precio final después del descuento
        setDiscountedPrice(response.data.precioFinal);
        setPointsRedeemed(true);
        
        // Actualizar puntos del usuario
        await fetchPoints();
        
        notify.success(t('trips.pointsRedeemedSuccess', { discount: formatCurrency(response.data.descuentoAplicado) }));
      }
    } catch (error) {
      console.error('Error al canjear puntos:', error);
      notify.error(error.errorMutationMsg || t('trips.errorRedeemingPoints'));
    } finally {
      setIsRedeemingPoints(false);
    }
  };

  // Obtener el precio final a pagar (considerando descuentos)
  const getFinalPrice = () => {
    if (discountedPrice !== null) return discountedPrice;
    if (hasPointsRedeemed()) return tripEndData.precioDescuento;
    return tripEndData?.precioTotal || 0;
  };

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
    if (!tripEndData) return '00:00';
    const minutes = tripEndData.tiempoViaje || 0;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleProceedToPayment = async () => {
    setIsLoading(true);
    setCityPassError('');
    try {
      // Crear PaymentIntent en el backend con el precio final
      const finalPrice = getFinalPrice();
      const paymentIntentData = {
        amount: finalPrice,
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
        notify.error(t('trips.errorCreatingPayment'));
      }
    } catch (error) {
      console.error('Error al crear el PaymentIntent:', error);
      notify.error(error.errorMutationMsg || 'Error al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayWithCityPass = async () => {
    setIsLoading(true);
    setCityPassError('');
    try {
      const finalPrice = getFinalPrice();
      const response = await payWithCityPassMutation.post({ monto: finalPrice });
      
      if (response?.success) {
        console.log('Pago con CityPass exitoso:', response);
        
        // Registrar pago exitoso
        await successfulPaymentMutation.post({ viajeId: tripEndData.id });
        
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
      const finalPrice = getFinalPrice();
      const response = await payWithBalanceMutation.post({ monto: finalPrice });
      
      if (response?.success) {
        console.log('Pago con saldo exitoso:', response);
        
        // Registrar pago exitoso
        await successfulPaymentMutation.post({ viajeId: tripEndData.id });
        
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

  const handlePaymentSuccess = async (paymentIntent) => {
    console.log('Pago exitoso con tarjeta:', stripePayment);
    console.log('Pago exitoso con tarjeta:', stripePayment.paymentMethodDetails);
    
    // Registrar pago exitoso
    await successfulPaymentMutation.post({ viajeId: tripEndData.id });
    
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
            {paymentStep === 'summary' && t('trips.tripSummary')}
            {paymentStep === 'payment' && t('trips.processing')}
            {paymentStep === 'processing' && t('trips.processing')}
            {paymentStep === 'success' && t('trips.paymentSuccessful')}
          </h1>
          <button
            className="btn-close"
            onClick={handleCancel}
            disabled={isLoading || paymentStep === 'processing'}
            aria-label={t('common.close')}
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
                  <h2 className="bike-id">{trip?.bicicleta?.id || tripEndData?.bicicletaId || 'N/A'}</h2>
                  <p className="bike-status">{t('trips.tripCompleted')}</p>
                </div>
              </div>

              <div className="trip-summary">
                <h3 className="summary-title">{t('trips.tripDetails')}</h3>
                <div className="summary-item">
                  <div className="summary-label">
                    <FaRegClock className="summary-icon" />
                    <span>{t('trips.duration')}</span>
                  </div>
                  <span className="summary-value">{calculateDuration()}</span>
                </div>
                
                <div className="summary-item">
                  <div className="summary-label">
                    <FaMoneyBillWave className="summary-icon" />
                    <span>{t('trips.tripPrice')}</span>
                  </div>
                  <span className="summary-value">
                    {formatCurrency(tripEndData?.precioSubtotal || 0)}
                  </span>
                </div>

                {tripEndData?.tiempoExtra > 0 && (
                  <div className="summary-item extra-time">
                    <div className="summary-label">
                      <FaRegClock className="summary-icon" />
                      <span>{t('trips.extraTime', { minutes: tripEndData.tiempoExtra })}</span>
                    </div>
                    <span className="summary-value">
                      {formatCurrency((tripEndData.precioTotal - tripEndData.precioSubtotal - tripEndData.impuesto) || 0)}
                    </span>
                  </div>
                )}

                <div className="summary-item">
                  <div className="summary-label">
                    <FaMoneyBillWave className="summary-icon" />
                    <span>{t('trips.tax')}</span>
                  </div>
                  <span className="summary-value">
                    {formatCurrency(tripEndData?.impuesto || 0)}
                  </span>
                </div>

                <div className="summary-item points">
                  <div className="summary-label">
                    <BsStarFill className="summary-icon" />
                    <span>{t('trips.pointsForPayment')}</span>
                  </div>
                  <span className="summary-value">2</span>
                </div>

                {/* Sección de redención de puntos */}
                {pointsData && !subscriptionData?.tiene_suscripcion && (
                  <div className="summary-item redeem-points">
                    <div className="summary-label-column">
                      <div className="summary-label">
                        <BsStarFill className="summary-icon" />
                        <span>{t('trips.redeemPoints')}</span>
                      </div>
                      {!hasPointsRedeemed() && !pointsRedeemed ? (
                        getRedeemablePoints() > 0 ? (
                          <>
                            <div className="points-info">
                              <div className="points-detail">
                                <span className="detail-label">{t('trips.availableRedemption')}</span>
                                <span className="detail-value">{getRedeemablePoints()}/{pointsData.puntos} pts</span>
                              </div>
                              <div className="points-detail discount">
                                <span className="detail-label">{t('trips.discount')}</span>
                                <span className="detail-value">-{formatCurrency(getDiscountAmount())}</span>
                              </div>
                            </div>
                            <button
                              className="btn-redeem-points"
                              onClick={handleRedeemPoints}
                              disabled={isRedeemingPoints || isLoading}
                            >
                              {isRedeemingPoints ? t('trips.applyingDiscount') : t('trips.applyDiscount')}
                            </button>
                          </>
                        ) : (
                          <span className="points-insufficient">{t('trips.insufficientPoints')}</span>
                        )
                      ) : (
                        <span className="points-redeemed">{t('trips.discountApplied')}</span>
                      )}
                    </div>
                  </div>
                )}
                
                {subscriptionData?.tiene_suscripcion && subscriptionData?.viajes_disponibles > 0 ? (
                  <div className="summary-item subscription">
                    <div className="summary-label">
                      <BsStarFill className="summary-icon" />
                      <span>{t('trips.subscriptionActive')}</span>
                    </div>
                    <span className="summary-value">{t('trips.freeTrip')}</span>
                  </div>
                ) : (
                  <div className="summary-item total">
                    <div className="summary-label">
                      <FaMoneyBillWave className="summary-icon" />
                      <span>{t('trips.totalToPay')}</span>
                    </div>
                    <span className="summary-value">
                      {formatCurrency(getFinalPrice())}
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
                    <p className="info-title">{t('trips.tripIncludedInSubscription')}</p>
                    <p className="info-description">
                      {t('trips.tripWillBeDeducted', { trips: subscriptionData.viajes_disponibles })}
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
                <span className="amount-label">{t('trips.totalToPay')}:</span>
                <span className="amount-value">{formatCurrency(getFinalPrice())}</span>
              </div>

              {/* Selector de método de pago */}
              <div className="payment-method-selector">
                <h3 className="selector-title">{t('trips.selectPaymentMethod')}</h3>
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
                    <span>{t('trips.creditDebitCard')}</span>
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
                    <span>{t('trips.bicibagueBalance')}</span>
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
                    <span>{t('trips.citypass')}</span>
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
                    {t('trips.amountDeductedFromBalance')}
                  </p>
                  {userBalance !== null && (
                    <div className="balance-display">
                      <span className="balance-label">{t('trips.yourCurrentBalance')}:</span>
                      <span className="balance-value">{formatCurrency(userBalance)}</span>
                    </div>
                  )}
                  {balanceError === 'insufficient_balance' && (
                    <div className="error-container">
                      <p className="error-text">{t('trips.insufficientBalanceBicibague')}</p>
                      <p className="error-hint">{t('trips.selectAnotherMethodOrRecharge')}</p>
                    </div>
                  )}
                  {balanceError === 'generic' && (
                    <div className="error-container">
                      <p className="error-text">{t('trips.errorProcessingBalancePayment')}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Mensaje CityPass */}
              {paymentMethod === 'citypass' && (
                <div className="citypass-payment-info">
                  <p className="info-text">
                    {t('trips.amountDeductedFromCitypass')}
                  </p>
                  {cityPassBalance !== null && (
                    <div className="balance-display">
                      <span className="balance-label">{t('trips.yourCitypassBalance')}:</span>
                      <span className="balance-value">{formatCurrency(cityPassBalance)}</span>
                    </div>
                  )}
                  {cityPassError === 'no_card' && (
                    <div className="error-container">
                      <p className="error-text">{t('trips.noLinkedCitypass')}</p>
                      <Link to="/profile" className="link-card-button">
                        {t('trips.linkCardNow')}
                      </Link>
                    </div>
                  )}
                  {cityPassError === 'insufficient_balance' && (
                    <div className="error-container">
                      <p className="error-text">{t('trips.insufficientBalanceCitypass')}</p>
                      <p className="error-hint">{t('trips.selectAnotherMethod')}</p>
                    </div>
                  )}
                  {cityPassError === 'generic' && (
                    <div className="error-container">
                      <p className="error-text">{t('trips.errorProcessingCitypassPayment')}</p>
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
              <p className="processing-text">{t('trips.processingPayment')}</p>
              <p className="processing-subtext">{t('trips.pleaseWait')}</p>
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
                  ? t('trips.tripCompletedTitle')
                  : t('trips.paymentSuccessful')}
              </h2>
              <p className="success-text">
                {subscriptionData?.tiene_suscripcion && subscriptionData?.viajes_disponibles > 0
                  ? t('trips.tripDeductedFromSubscription', { remaining: subscriptionData.viajes_disponibles - 1 })
                  : t('trips.thankYou')}
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
              {t('common.cancel')}
            </button>
            {paymentStep === 'summary' && (
              <button
                className="btn-proceed"
                onClick={
                  subscriptionData?.tiene_suscripcion && subscriptionData?.viajes_disponibles > 0
                    ? async () => {
                        // Registrar pago exitoso por suscripción
                        await successfulPaymentMutation.post({ viajeId: tripEndData.id });
                        
                        setPaymentStep('success');
                        setTimeout(() => {
                          onTripEnded();
                          onClose();
                          navigate('/trips');
                        }, 2000);
                      }
                    : handleProceedToPayment
                }
                disabled={isLoading || isCheckingSubscription}
              >
                {isLoading || isCheckingSubscription ? (
                  <>
                    <span className="spinner"></span>
                  </>
                ) : subscriptionData?.tiene_suscripcion && subscriptionData?.viajes_disponibles > 0 ? (
                  t('trips.endTrip')
                ) : (
                  t('trips.proceedToPayment')
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
                    {t('trips.processing')}
                  </>
                ) : (
                  <>
                    {paymentMethod === 'card' || paymentMethod === 'citypass' ? (
                      <FaCreditCard className="btn-icon" />
                    ) : (
                      <FaMoneyBillWave className="btn-icon" />
                    )}
                    {t('trips.pay')} {formatCurrency(getFinalPrice())}
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
