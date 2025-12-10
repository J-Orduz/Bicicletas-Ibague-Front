import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PreferencesContext = createContext();

export const PreferencesProvider = ({ children }) => {
  const { i18n } = useTranslation();
  
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
      language: 'es', // Idioma por defecto
      // theme: 'light',
      // notifications: true,
    };
  });

  // Guardar preferencias en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  }, [preferences]);

  // Sincronizar el idioma con i18next cuando cambie la preferencia
  useEffect(() => {
    if (preferences.language && i18n.language !== preferences.language) {
      i18n.changeLanguage(preferences.language);
    }
  }, [preferences.language, i18n]);

  // Función genérica para actualizar cualquier preferencia
  const updatePreference = (key, value) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
    
    // Si se actualiza el idioma, también actualizar i18next
    if (key === 'language') {
      i18n.changeLanguage(value);
      localStorage.setItem('userLanguage', value);
    }
  };

  // Función para resetear preferencias
  const resetPreferences = () => {
    const defaultPreferences = {
      currency: 'COP',
      language: 'es',
    };
    setPreferences(defaultPreferences);
    localStorage.setItem('userPreferences', JSON.stringify(defaultPreferences));
    i18n.changeLanguage('es');
    localStorage.setItem('userLanguage', 'es');
  };

  const value = {
    preferences,
    currency: preferences.currency,
    language: preferences.language,
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
