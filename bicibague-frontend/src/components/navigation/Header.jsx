import { Link } from 'react-router-dom';
import { useTheme } from '@hooks/useTheme';
import { useScrollDirection } from '@hooks/useScrollDirection';
// styles
import './Header.scss';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const scrollDirection = useScrollDirection();

  return (
    <header className={`header ${scrollDirection === 'down' ? 'header--hidden' : ''}`}>
      <h1>BicIbagué</h1>
      <nav>
        <ul>
          <li>
            <Link className="link" to="/home">
              Home
            </Link>
          </li>
          <li>
            <Link className="link" to="/reserves">Reservas</Link>
          </li>
          <li>
            <Link className="link" to="/trips">Viajes</Link>
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
