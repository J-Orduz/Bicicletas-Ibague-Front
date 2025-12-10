import { useState, useEffect } from 'react';
import { usePreferences } from '@contexts/PreferencesContext';

export const useTheme = () => {
  const { preferences, updatePreference } = usePreferences();
  
  // Obtener el tema guardado o usar el preferido del sistema
  const getInitialTheme = () => {
    // const savedTheme = localStorage.getItem('theme');
    const savedTheme = preferences.theme;
    if (savedTheme) {
      return savedTheme;
    }
    // Detectar preferencia del sistema
    // return window.matchMedia('(prefers-color-scheme: dark)').matches 
    //   ? 'dark' 
    //   : 'light';
    return 'dark'; // valor por defecto
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    // Aplicar el tema al elemento raíz
    document.documentElement.setAttribute('data-theme', theme);
    // Actualizar la preferencia en el contexto del localStorage
    updatePreference('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
};
