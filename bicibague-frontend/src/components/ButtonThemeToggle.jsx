// hooks
import { useTheme } from '@hooks/useTheme';
// icons
import { FaRegMoon, FaRegSun } from 'react-icons/fa6'
// styles
import './components.scss';

export const ButtonThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === 'light' ? (
        <FaRegMoon className="theme-icon" />
      ) : (
        <FaRegSun className="theme-icon" />
      )}
    </button>
  );
};
