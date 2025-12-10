import { useState } from 'react';
import { useTranslation } from 'react-i18next';
// components
import { SubscriptionPaymentModal } from './SubscriptionPaymentModal';
// hooks
import { useCurrency } from '@hooks/useCurrency';
// icons
import {
  BsStar,
  BsStarFill,
  BsCheckCircleFill,
  BsXCircleFill,
  BsCalendar3,
} from 'react-icons/bs';
// styles
import './SubscriptionSection.scss';

export const SubscriptionSection = ({
  subscriptionData,
  createSubscription,
  cancelSubscription,
  onSubscriptionChange,
}) => {
  const { formatCurrency } = useCurrency();
  const { t } = useTranslation();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  const handleCreateSubscription = () => {
    setShowSubscriptionModal(true);
  };

  const handleSubscriptionSuccess = async () => {
    setShowSubscriptionModal(false);
    onSubscriptionChange?.();
  };

  const handleCancelSubscription = async () => {
    const confirmed = window.confirm(
      t('subscription.cancelConfirmation')
    );

    if (!confirmed) return;

    try {
      await cancelSubscription.post();
      alert(t('subscription.cancelSuccess'));
      onSubscriptionChange?.();
    } catch (error) {
      alert(error.errorMutationMsg || 'Error al cancelar la suscripción');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const SUBSCRIPTION_PRICE = 150000;

  return (
    <>
      <div className="subscription-section">
        <div className="subscription-header">
          <BsStarFill className="subscription-icon" />
          <h2 className="section-title">{t('profile.subscription')}</h2>
        </div>

        {subscriptionData?.tiene_suscripcion ? (
          <div className="subscription-active">
            <div className="subscription-info">
              <div className="info-item">
                <span className="info-label">{t('subscription.plan')}:</span>
                <span className="info-value">{t('subscription.planName')}</span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('subscription.price')}:</span>
                <span className="info-value">
                  {formatCurrency(SUBSCRIPTION_PRICE)}/mes
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">{t('subscription.status')}:</span>
                <span className="info-value status-active">
                  {subscriptionData.estado || t('subscription.active')}
                </span>
              </div>
            </div>

            <div className="subscription-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <BsCheckCircleFill />
                </div>
                <div className="stat-content">
                  <span className="stat-label">{t('subscription.tripsAvailable')}</span>
                  <span className="stat-value highlight">
                    {subscriptionData.viajes_disponibles || 50}
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <BsCalendar3 />
                </div>
                <div className="stat-content">
                  <span className="stat-label">{t('subscription.daysRemaining')}</span>
                  <span className="stat-value">
                    {subscriptionData.dias_restantes || 30} {t('subscription.days')}
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <BsCalendar3 />
                </div>
                <div className="stat-content">
                  <span className="stat-label">{t('subscription.expirationDate')}</span>
                  <span className="stat-value">
                    {formatDate(subscriptionData.fecha_vencimiento)}
                  </span>
                </div>
              </div>
            </div>

            <div className="subscription-benefits">
              <h3 className="benefits-title">{t('subscription.benefitsIncluded')}:</h3>
              <ul className="benefits-list">
                <li>
                  <BsCheckCircleFill className="benefit-icon" />
                  {t('subscription.benefit1')}
                </li>
                <li>
                  <BsCheckCircleFill className="benefit-icon" />
                  {t('subscription.benefit2')}
                </li>
              </ul>
            </div>

            <button
              className="btn-cancel-subscription"
              onClick={handleCancelSubscription}
            >
              <BsXCircleFill /> {t('subscription.cancel')}
            </button>
          </div>
        ) : (
          <div className="subscription-inactive">
            <div className="subscription-promo">
              <h3 className="promo-title">{t('subscription.subscribeTitle')}</h3>
              <p className="promo-price">
                {formatCurrency(SUBSCRIPTION_PRICE)}/mes
              </p>
            </div>

            <div className="subscription-benefits">
              <h4 className="benefits-title">{t('subscription.benefitsIncluded')}:</h4>
              <ul className="benefits-list">
                <li>
                  <BsCheckCircleFill className="benefit-icon" />
                  {t('subscription.benefit1')}
                </li>
                <li>
                  <BsCheckCircleFill className="benefit-icon" />
                  {t('subscription.benefit2')}
                </li>
              </ul>
            </div>

            <button
              className="btn-subscribe"
              onClick={handleCreateSubscription}
            >
              <BsStar /> {t('subscription.subscribeNow')}
            </button>
          </div>
        )}
      </div>

      {showSubscriptionModal && (
        <SubscriptionPaymentModal
          onClose={() => setShowSubscriptionModal(false)}
          onSuccess={handleSubscriptionSuccess}
          createSubscription={createSubscription}
        />
      )}
    </>
  );
};
