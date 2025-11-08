import { Link } from 'react-router-dom';
import { useTheme } from '@hooks/useTheme';
// styles
import './Header.scss';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header">
      <h1>Bicibague</h1>
      <nav>
        <ul>
          <li>
            <Link className="link" to="/home">
              Home
            </Link>
          </li>
          <li>
            <Link className="link" to="/about">About</Link>
          </li>
        </ul>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>
    </header>
  );
};
