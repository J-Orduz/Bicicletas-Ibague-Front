import { useEffect, useState } from 'react';
// components
import { SubHeader } from '@layouts/SubHeader';
import { SubscriptionSection } from './SubscriptionSection';
// hooks
import { useAuth } from '@contexts/AuthContext';
import { usePreferences } from '@contexts/PreferencesContext';
import { useCurrency } from '@hooks/useCurrency';
// API
import {
  useGetCurrentBalance,
  useCreateRechargeMutation,
  useGetSubscription,
  useCreateSubscriptionMutation,
  useCancelSubscriptionMutation,
  useGetCityPassBalance,
  useLinkCityPassMutation,
  useGetPoints,
} from '@api/payments';
// icons
import {
  BsXLg,
  BsPersonCircle,
  BsCreditCard2Front,
  BsCashStack,
  BsGearFill,
  BsStarFill,
} from 'react-icons/bs';
// styles
import './profile.scss';

export const Profile = () => {
  const { logout, user } = useAuth();
  const { formatCurrency, CURRENCIES } = useCurrency();
  const { currency, updatePreference } = usePreferences();

  // Estados
  const [userData, setUserData] = useState({
    userId: user.id,
    userEmail: user.email,
    userName: user.nombre,
    userRole: user.rol,
    userBalance: 0,
  });
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [cityPassData, setCityPassData] = useState(null);
  const [showLinkCityPassModal, setShowLinkCityPassModal] = useState(false);
  const [pointsData, setPointsData] = useState(null);
  // API hooks
  const getCurrentBalance = useGetCurrentBalance();
  const getSubscription = useGetSubscription();
  const createSubscriptionMutation = useCreateSubscriptionMutation();
  const cancelSubscriptionMutation = useCancelSubscriptionMutation();
  const getCityPassBalance = useGetCityPassBalance();
  const linkCityPassMutation = useLinkCityPassMutation();
  const getPoints = useGetPoints();

  useEffect(() => {
    // document.title = 'Perfil de Usuario'; // :o
    const fetchBalance = async () => {
      try {
        const balanceData = await getCurrentBalance.get();
        // setUserData({
        //   // userId: balanceData.usuario.id,
        //   // userEmail: balanceData.usuario.email,
        //   // userName: balanceData.usuario.nombre,
        //   userBalance: balanceData.usuario.saldo,
        // });
        setUserData((prevData) => ({
          ...prevData,
          userBalance: balanceData.usuario.saldo,
        }));
      } catch (error) {
        console.error(error);
      }
    };

    const fetchSubscription = async () => {
      try {
        const subData = await getSubscription.get();
        setSubscriptionData(subData);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchCityPassBalance = async () => {
      try {
        const cityPassResponse = await getCityPassBalance.get();
        setCityPassData(cityPassResponse.data);
      } catch (error) {
        // Si no tiene tarjeta vinculada, establecer como null
        if (error.status === 400) {
          setCityPassData(null);
        } else {
          console.error(error);
        }
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

    fetchBalance();
    fetchSubscription();
    fetchCityPassBalance();
    fetchPoints();
  }, []);

  const handleSubscriptionChange = async () => {
    try {
      // Refrescar datos de suscripción
      const subData = await getSubscription.get();
      setSubscriptionData(subData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleLinkCityPassSuccess = async () => {
    try {
      // Refrescar datos de CityPass
      const cityPassResponse = await getCityPassBalance.get();
      setCityPassData(cityPassResponse.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="profile-container">
      <SubHeader pageTitle="Perfil" />
      <div className="profile-content">
        {userData ? (
          <>
            <div className="user-info-section">
              <div className="user-avatar">
                <BsPersonCircle className="avatar-icon" />
              </div>
              <div className="user-details">
                <h2 className="user-name">{userData.userName}</h2>
                <p className="user-email">{userData.userEmail}</p>
                <div className="user-role">Rol: {userData.userRole.toUpperCase()}</div>
                <p className="user-id">ID: {userData.userId}</p>
              </div>
              <button className="logout-button" onClick={logout}>
                Cerrar Sesión
              </button>
            </div>

            <div className="balance-section">
              {/* BiciPuntos */}
              {pointsData && (
                <div className="balance-card points-card">
                  <span className="balance-label">BiciPuntos</span>
                  <span className="balance-amount points-amount">
                    {pointsData.puntos}
                  </span>
                  <div className="points-equivalence">
                    <span className="equivalence-text">
                      {formatCurrency(pointsData.puntos * 100)}
                    </span>
                  </div>
                </div>
              )}
              {/* Saldo Principal */}
              <div className="balance-card">
                <span className="balance-label">Saldo BiciBague</span>
                <span className="balance-amount">
                  {formatCurrency(userData.userBalance)}
                </span>
                <button
                  className="btn-recharge"
                  onClick={() => setShowRechargeModal(true)}
                >
                  <BsCreditCard2Front /> Recargar Saldo
                </button>
              </div>

              {/* Saldo CityPass */}
              <div className="balance-card citypass-card">
                <span className="balance-label">Saldo CityPass</span>
                {cityPassData ? (
                  <>
                    <span className="balance-amount citypass-amount">
                      {formatCurrency(cityPassData.tarjeta.saldo)}
                    </span>
                    <span className="card-number">
                      {cityPassData.tarjeta.card_number}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="no-card-message">
                      No tienes una tarjeta vinculada
                    </span>
                    <button
                      className="btn-link-citypass"
                      onClick={() => setShowLinkCityPassModal(true)}
                    >
                      <BsCreditCard2Front /> Vincular Tarjeta
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Sección de Suscripción */}
            <SubscriptionSection
              subscriptionData={subscriptionData}
              createSubscription={createSubscriptionMutation}
              cancelSubscription={cancelSubscriptionMutation}
              onSubscriptionChange={handleSubscriptionChange}
            />

            {/* Sección de Preferencias */}
            <div className="preferences-section">
              <div className="preferences-header">
                <BsGearFill className="preferences-icon" />
                <h2 className="section-title">Preferencias</h2>
              </div>

              <div className="preferences-content">
                <div className="preference-item">
                  <div className="preference-info">
                    <span className="preference-label">Moneda</span>
                    <span className="preference-description">
                      Selecciona la moneda para mostrar los precios
                    </span>
                  </div>
                  <div className="preference-control">
                    <select
                      className="preference-selector"
                      value={currency}
                      onChange={(e) =>
                        updatePreference('currency', e.target.value)
                      }
                    >
                      {Object.entries(CURRENCIES).map(([code, info]) => (
                        <option key={code} value={code}>
                          {info.symbol} {info.code} - {info.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Espacio para futuras preferencias */}
                {/* 
                <div className="preference-item">
                  <div className="preference-info">
                    <span className="preference-label">Idioma</span>
                    <span className="preference-description">
                      Selecciona el idioma de la aplicación
                    </span>
                  </div>
                  <div className="preference-control">
                    <select className="preference-selector">
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>
                */}
              </div>
            </div>
          </>
        ) : (
          <div className="loading-state">
            <p>Cargando información del usuario...</p>
          </div>
        )}
      </div>

      {showRechargeModal && (
        <RechargeModal onClose={() => setShowRechargeModal(false)} />
      )}

      {showLinkCityPassModal && (
        <LinkCityPassModal
          onClose={() => setShowLinkCityPassModal(false)}
          onSuccess={handleLinkCityPassSuccess}
          linkCityPassMutation={linkCityPassMutation}
        />
      )}
    </div>
  );
};

const LinkCityPassModal = ({ onClose, onSuccess, linkCityPassMutation }) => {
  const [cardSuffix, setCardSuffix] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleCardSuffixChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Solo números
    if (value.length <= 4) {
      setCardSuffix(value);
      setError('');
    }
  };

  const validateCardNumber = () => {
    if (cardSuffix.length !== 4) {
      setError('Debes ingresar exactamente 4 dígitos');
      return false;
    }
    return true;
  };

  const handleLinkCard = async () => {
    if (!validateCardNumber()) return;

    const fullCardNumber = `1010${cardSuffix}`;
    setIsProcessing(true);
    setError('');

    try {
      await linkCityPassMutation.post({ cardNumber: fullCardNumber });
      alert('Tarjeta CityPass vinculada exitosamente');
      onSuccess();
      onClose();
    } catch (err) {
      if (err.errorJsonMsg?.includes('ya está en uso')) {
        setError('El número de tarjeta ya está en uso');
      } else {
        setError(err.errorMutationMsg || 'Error al vincular la tarjeta');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('recharge-modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="recharge-modal-overlay" onClick={handleOverlayClick}>
      <div className="recharge-modal">
        <div className="modal-header">
          <h1>Vincular Tarjeta CityPass</h1>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">
            <BsXLg className="btn-icon" />
          </button>
        </div>

        <div className="modal-body">
          <div className="citypass-form">
            <p className="form-description">
              Ingresa los últimos 4 dígitos de tu tarjeta CityPass que comienza
              con 1010.
            </p>

            <div className="card-number-input">
              <div className="input-group">
                <span className="input-prefix">1010</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="4"
                  value={cardSuffix}
                  onChange={handleCardSuffixChange}
                  placeholder="0000"
                  className="suffix-input"
                  disabled={isProcessing}
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <p className="input-hint">
                Número completo: 1010{cardSuffix || ' _ _ _ _'}
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button
            className="btn-confirm"
            onClick={handleLinkCard}
            disabled={cardSuffix.length !== 4 || isProcessing}
          >
            {isProcessing ? 'Vinculando...' : 'Vincular Tarjeta'}
          </button>
        </div>
      </div>
    </div>
  );
};

const RechargeModal = ({ onClose }) => {
  const { token } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const createRechargeMutation = useCreateRechargeMutation();

  const predefinedAmounts = [
    { value: 10000, label: '$10.000' },
    { value: 20000, label: '$20.000' },
    { value: 50000, label: '$50.000' },
    { value: 100000, label: '$100.000' },
  ];

  const getSelectedAmountValue = () => {
    return selectedAmount;
  };

  const validateAmount = () => {
    if (!selectedAmount) {
      alert('Por favor selecciona un monto');
      return false;
    }

    return true;
  };

  const handleUseCard = async () => {
    if (!validateAmount()) return;

    const amount = getSelectedAmountValue();

    setIsProcessing(true);
    try {
      const response = await createRechargeMutation.post({
        monto: amount,
        authorization: `Bearer ${token}`,
      });

      if (response?.url) {
        // Navegar a la URL de Stripe en otra pestaña
        window.open(response.url, '_blank');
      } else {
        alert('No se pudo obtener la URL de pago');
      }
    } catch (error) {
      alert(error.errorMutationMsg || 'Error al procesar el pago con tarjeta');
      setIsProcessing(false);
    }
    setIsProcessing(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('recharge-modal-overlay')) {
      onClose();
    }
  };

  return (
    <div className="recharge-modal-overlay" onClick={handleOverlayClick}>
      <div className="recharge-modal">
        <div className="modal-header">
          <h1>Recargar Saldo</h1>
          <button className="btn-close" onClick={onClose} aria-label="Cerrar">
            <BsXLg className="btn-icon" />
          </button>
        </div>

        <div className="modal-body">
          <div className="amount-selection">
            <h3>Selecciona el monto a recargar:</h3>
            <div className="amounts-grid">
              {predefinedAmounts.map((amount) => (
                <label key={amount.value} className="amount-item">
                  <input
                    type="radio"
                    name="amount"
                    value={amount.value}
                    checked={selectedAmount === amount.value}
                    onChange={(e) => setSelectedAmount(amount.value)}
                  />
                  <span className="amount-content">
                    <span className="amount-icon">
                      <BsCashStack />
                    </span>
                    <span className="amount-label">{amount.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={onClose}
            disabled={isProcessing}
          >
            Cancelar
          </button>
          <button
            className="btn-use-card"
            onClick={handleUseCard}
            disabled={!selectedAmount || isProcessing}
          >
            {isProcessing ? (
              'Procesando...'
            ) : (
              <>
                <BsCreditCard2Front /> Recargar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
