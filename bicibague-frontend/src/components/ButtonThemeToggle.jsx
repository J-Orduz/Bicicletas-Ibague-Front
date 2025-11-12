// hooks
import { useTheme } from '@hooks/useTheme';
import { useScrollDirection } from '@hooks/useScrollDirection';
// icons
import { FaRegMoon, FaRegSun } from 'react-icons/fa6';
// styles
import './components.scss';

export const ButtonThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const scrollDirection = useScrollDirection();

  return (
    <button
      className={`theme-toggle ${
        scrollDirection === 'down' ? 'theme-toggle--hidden' : ''
      }`}
      onClick={toggleTheme}
    >
      {theme === 'light' ? (
        <FaRegMoon className="theme-icon" />
      ) : (
        <FaRegSun className="theme-icon" />
      )}
    </button>
  );
};
