import { Link } from 'react-router-dom';
import { useTheme } from '@hooks/useTheme';
import { useScrollDirection } from '@hooks/useScrollDirection';
// icons
import {
  FaUser,
  FaRegMap,
  FaRegBookmark,
  FaBicycle,
  FaRegMoon,
  FaRegSun,
} from 'react-icons/fa6';
// styles
import './Header.scss';

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const scrollDirection = useScrollDirection();

  return (
    <header
      className={`header ${scrollDirection === 'down' ? 'header--hidden' : ''}`}
    >
      <h1>BicIbagué</h1>
      <nav>
        <ul>
          <li>
            <Link className="link" to="/">
              <FaRegMap className='header-item-icon map-icon'/>
              <span>Mapa</span>
            </Link>
          </li>
          <li>
            <Link className="link" to="/reserves">
              <FaRegBookmark className='header-item-icon'/>
              <span>Reservas</span>
            </Link>
          </li>
          <li>
            <Link className="link" to="/trips">
              <FaBicycle className='header-item-icon bicycle-icon'/>
              <span>Viajes</span>
            </Link>
          </li>
          <li>
            <Link className="link" to="/register">
              <FaUser className='header-item-icon'/>
              <span>Perfil</span>
            </Link>
          </li>
        </ul>
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? (
            <FaRegMoon className="theme-icon" />
          ) : (
            <FaRegSun className="theme-icon" />
          )}
        </button>
      </nav>
    </header>
  );
};
