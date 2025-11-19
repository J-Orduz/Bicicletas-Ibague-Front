import { usePreferences } from '@contexts/PreferencesContext';

// TODO: Actualizar conversión dinámicamente con una API
const EXCHANGE_RATE = 3736.51;

// Tipos de moneda disponibles
export const CURRENCIES = {
  COP: {
    code: 'COP',
    symbol: '$',
    name: 'Peso Colombiano',
    locale: 'es-CO',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dólar Estadounidense',
    locale: 'en-US',
  },
};

// Hook personalizado para formatear valores monetarios según las preferencias de moneda del usuario
export const useCurrency = () => {
  const { preferences } = usePreferences();

  const formatCurrency = (amountInCOP) => {
    if (amountInCOP === null || amountInCOP === undefined) {
      return 0;
    }

    let convertedAmount = amountInCOP;

    if (preferences.currency === 'USD') {
      convertedAmount = amountInCOP / EXCHANGE_RATE;
    }

    const currencyInfo = CURRENCIES[preferences.currency];

    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      // formateo de decimales según la moneda (COP no usa decimales)
      minimumFractionDigits: preferences.currency === 'USD' ? 2 : 0,
      maximumFractionDigits: preferences.currency === 'USD' ? 2 : 0,
    }).format(convertedAmount);
  };

  return { formatCurrency, CURRENCIES };
};
