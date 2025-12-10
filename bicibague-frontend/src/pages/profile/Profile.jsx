import { useEffect, useState } from 'react';
// components
import { SubHeader } from '@layouts/SubHeader';
import { SubscriptionSection } from './SubscriptionSection';
// hooks
import { useAuth } from '@contexts/AuthContext';
import { usePreferences } from '@contexts/PreferencesContext';
import { useCurrency } from '@hooks/useCurrency';
import { useTranslation } from 'react-i18next';
import { useNotifier } from '@hooks/useNotifier';
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
  const { currency, language, updatePreference } = usePreferences();
  const { t } = useTranslation();

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
      <SubHeader pageTitle={t('profile.title')} />
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
                <div className="user-role">
                  {t('profile.role')}: {userData.userRole.toUpperCase()}
                </div>
                <p className="user-id">{t('profile.id')}: {userData.userId}</p>
              </div>
              <button className="logout-button" onClick={logout}>
                {t('auth.logout')}
              </button>
            </div>

            <div className="balance-section">
              {/* BiciPuntos */}
              <div className="balance-card points-card">
                <span className="balance-label">{t('profile.biciPoints')}</span>
                <span className="balance-amount points-amount">
                  {pointsData?.puntos || 0}
                </span>
                <div className="points-equivalence">
                  <span className="equivalence-text">
                    {formatCurrency((pointsData?.puntos || 0) * 100)}
                  </span>
                </div>
              </div>
              {/* Saldo Principal */}
              <div className="balance-card">
                <span className="balance-label">{t('profile.bicibagueBalance')}</span>
                <span className="balance-amount">
                  {formatCurrency(userData.userBalance)}
                </span>
                <button
                  className="btn-recharge"
                  onClick={() => setShowRechargeModal(true)}
                >
                  <BsCreditCard2Front /> {t('profile.recharge')}
                </button>
              </div>

              {/* Saldo CityPass */}
              <div className="balance-card citypass-card">
                <span className="balance-label">{t('profile.citypassBalance')}</span>
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
                      {t('profile.noCardLinked')}
                    </span>
                    <button
                      className="btn-link-citypass"
                      onClick={() => setShowLinkCityPassModal(true)}
                    >
                      <BsCreditCard2Front /> {t('profile.linkCard')}
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
                <h2 className="section-title">{t('profile.preferences')}</h2>
              </div>

              <div className="preferences-content">
                <div className="preference-item">
                  <div className="preference-info">
                    <span className="preference-label">{t('profile.currency')}</span>
                    <span className="preference-description">
                      {t('profile.currencyDescription')}
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

                {/* Preferencia de idioma */}
                <div className="preference-item">
                  <div className="preference-info">
                    <span className="preference-label">{t('profile.language')}</span>
                    <span className="preference-description">
                      {t('profile.languageDescription')}
                    </span>
                  </div>
                  <div className="preference-control">
                    <select
                      className="preference-selector"
                      value={language}
                      onChange={(e) =>
                        updatePreference('language', e.target.value)
                      }
                    >
                      <option value="es">{t('languages.es')}</option>
                      <option value="en">{t('languages.en')}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="loading-state">
            <p>{t('profile.loadingUserInfo')}</p>
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
  const { t } = useTranslation();
  const notify = useNotifier();
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
      setError(t('citypass.errorGeneral'));
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
      notify.success(t('citypass.successMessage'));
      onSuccess();
      onClose();
    } catch (err) {
      if (err.errorJsonMsg?.includes('ya está en uso')) {
        setError(t('citypass.errorInUse'));
      } else {
        setError(err.errorMutationMsg || t('citypass.errorGeneral'));
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
          <h1>{t('citypass.linkTitle')}</h1>
          <button className="btn-close" onClick={onClose} aria-label={t('common.close')}>
            <BsXLg className="btn-icon" />
          </button>
        </div>

        <div className="modal-body">
          <div className="citypass-form">
            <p className="form-description">
              {t('citypass.description')}
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
                {t('citypass.completeNumber')} 1010{cardSuffix || ' _ _ _ _'}
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
            {t('common.cancel')}
          </button>
          <button
            className="btn-confirm"
            onClick={handleLinkCard}
            disabled={cardSuffix.length !== 4 || isProcessing}
          >
            {isProcessing ? t('citypass.linking') : t('citypass.linkCard')}
          </button>
        </div>
      </div>
    </div>
  );
};

const RechargeModal = ({ onClose }) => {
  const { token } = useAuth();
  const { t } = useTranslation();
  const notify = useNotifier();
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
      notify.warn(t('recharge.selectAmountAlert'));
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
        notify.error(t('recharge.processingURLError'));
      }
    } catch (error) {
      notify.error(error.errorMutationMsg || 'Error al procesar el pago con tarjeta');
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
          <h1>{t('recharge.title')}</h1>
          <button className="btn-close" onClick={onClose} aria-label={t('common.close')}>
            <BsXLg className="btn-icon" />
          </button>
        </div>

        <div className="modal-body">
          <div className="amount-selection">
            <h3>{t('recharge.selectAmount')}</h3>
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
            {t('common.cancel')}
          </button>
          <button
            className="btn-use-card"
            onClick={handleUseCard}
            disabled={!selectedAmount || isProcessing}
          >
            {isProcessing ? (
              t('recharge.processing')
            ) : (
              <>
                <BsCreditCard2Front /> {t('recharge.recharge')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
