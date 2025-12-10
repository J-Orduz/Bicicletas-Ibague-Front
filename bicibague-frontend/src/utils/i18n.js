import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import es from '../locales/es.json';
import en from '../locales/en.json';

const resources = {
  es: es,
  en: en,
};

i18n
  .use(LanguageDetector) // Detecta el idioma del navegador
  .use(initReactI18next) // Pasa i18n a react-i18next
  .init({
    resources,
    fallbackLng: 'es', // Idioma por defecto
    
    lng: localStorage.getItem('userPreferences.language') || 'es', // Idioma inicial desde localStorage o español
    debug: false, // Cambia a true para ver logs en desarrollo
    interpolation: {
      escapeValue: false, // React ya hace el escape
    },
    detection: {
      order: ['localStorage', 'navigator'], // Prioriza localStorage sobre el navegador
      caches: ['localStorage'], // Guarda el idioma seleccionado
    },
  });

export default i18n;
