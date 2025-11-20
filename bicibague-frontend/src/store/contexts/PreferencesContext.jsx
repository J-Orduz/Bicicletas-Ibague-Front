import { createContext, useContext, useState, useEffect } from 'react';

const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
  // Cargar preferencias desde localStorage o usar valores por defecto
  const [preferences, setPreferences] = useState(() => {
    const savedPreferences = localStorage.getItem('userPreferences');
    if (savedPreferences) {
      try {
        return JSON.parse(savedPreferences);
      } catch (error) {
        console.error('Error al cargar preferencias:', error);
      }
    }
    return {
      currency: 'COP', // Moneda por defecto
      // theme: 'light',
      // language: 'es',
      // notifications: true,
    };
  });

  // Guardar preferencias en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  // Función genérica para actualizar cualquier preferencia
  const updatePreference = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Función para resetear preferencias
  const resetPreferences = () => {
    const defaultPreferences = {
      currency: 'COP',
    };
    setPreferences(defaultPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(defaultPreferences));
  };

  const value = {
    preferences,
    currency: preferences.currency,
    updatePreference,
    resetPreferences,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};

// Hook para usar el contexto
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error(
      'usePreferences debe ser usado dentro de PreferencesProvider'
    );
  }
  return context;
};
