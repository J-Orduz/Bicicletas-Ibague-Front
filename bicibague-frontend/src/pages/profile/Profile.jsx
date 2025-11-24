import { useEffect, useState } from "react";
// components
import { SubHeader } from "@layouts/SubHeader";
// hooks
import { useAuth } from "@contexts/AuthContext";
import { usePreferences } from "@contexts/PreferencesContext";
import { useCurrency } from "@hooks/useCurrency";
// API
import {
  useGetCurrentBalance,
  useCreateRechargeMutation,
  useSimulateRechargeMutation,
} from "@api/payments";
// icons
import {
  BsXLg,
  BsPersonCircle,
  BsCreditCard2Front,
  BsCashStack,
  BsGearFill,
} from "react-icons/bs";
// styles
import "./Profile.scss";

export const Profile = () => {
  const { logout } = useAuth();
  const { formatCurrency, CURRENCIES } = useCurrency();
  const { currency, updatePreference } = usePreferences();

  // Estados
  const [userData, setUserData] = useState(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  // API hooks
  const getCurrentBalance = useGetCurrentBalance();
  const simulateRechargeMutation = useSimulateRechargeMutation();

  useEffect(() => {
    // document.title = 'Perfil de Usuario'; // :o
    const fetchBalance = async () => {
      try {
        const balanceData = await getCurrentBalance.get();
        setUserData({
          userId: balanceData.usuario.id,
          userEmail: balanceData.usuario.email,
          userName: balanceData.usuario.nombre,
          userBalance: balanceData.usuario.saldo,
        });
      } catch (error) {
        // console.error(error.errorFetchMsg || error);
      }
    };

    fetchBalance();
  }, []);

  const handleRechargeSuccess = async (amount) => {
    try {
      const rechargeData = {
        type: "checkout.session.completed",
        data: {
          object: {
            id: "cs_test_abc123",
            metadata: {
              usuario_id: userData?.userId || "desconocido",
              tipo: "recarga_saldo",
              monto: amount.toString(),
            },
            customer_email: userData?.userEmail || "desconocido",
            payment_status: "paid",
            status: "complete",
          },
        },
      };

      const response = await simulateRechargeMutation.post(rechargeData);

      if (response?.received) {
        alert("Recarga simulada exitosamente");
        // Refrescar el saldo
        const balanceData = await getCurrentBalance.get();
        setUserData({
          userId: balanceData.usuario.id,
          userEmail: balanceData.usuario.email,
          userName: balanceData.usuario.nombre,
          userBalance: balanceData.usuario.saldo,
        });
      }
    } catch (error) {
      alert(error.errorMutationMsg || "Error al procesar la recarga");
    }
  };

  return (
    <div className="profile-container">
      <SubHeader pageTitle="Perfil de Usuario" />
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
                <p className="user-id">ID: {userData.userId}</p>
              </div>
              <button className="logout-button" onClick={logout}>
                Cerrar Sesión
              </button>
            </div>

            <div className="balance-section">
              <div className="balance-card">
                <span className="balance-label">Saldo Disponible</span>
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
            </div>

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
                        updatePreference("currency", e.target.value)
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
        <RechargeModal
          onClose={() => setShowRechargeModal(false)}
          onRecharge={handleRechargeSuccess}
        />
      )}
    </div>
  );
};

const RechargeModal = ({ onClose, onRecharge }) => {
  const { token } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const createRechargeMutation = useCreateRechargeMutation();

  const predefinedAmounts = [
    { value: 10000, label: "$10.000" },
    { value: 20000, label: "$20.000" },
    { value: 50000, label: "$50.000" },
    { value: 100000, label: "$100.000" },
  ];

  const getSelectedAmountValue = () => {
    return selectedAmount;
  };

  const validateAmount = () => {
    if (!selectedAmount) {
      alert("Por favor selecciona un monto");
      return false;
    }

    return true;
  };

  const handleRecharge = () => {
    if (!validateAmount()) return;

    const amount = getSelectedAmountValue();
    onRecharge(amount);
    onClose();
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
        window.open(response.url, "_blank");
      } else {
        alert("No se pudo obtener la URL de pago");
      }
    } catch (error) {
      alert(error.errorMutationMsg || "Error al procesar el pago con tarjeta");
      setIsProcessing(false);
    }
    setIsProcessing(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("recharge-modal-overlay")) {
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
              "Procesando..."
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
