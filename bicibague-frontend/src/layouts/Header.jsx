import { Link } from 'react-router-dom';
// hooks
import { useScrollDirection } from '@hooks/useScrollDirection';
// components
import { ButtonThemeToggle } from '@components/buttonThemeToggle';
// icons
import { FaUser, FaRegMap, FaRegBookmark, FaBicycle } from 'react-icons/fa6';
// styles
import './Header.scss';

export const Header = () => {
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
              <FaRegMap className="header-item-icon map-icon" />
              <span>Mapa</span>
            </Link>
          </li>
          <li>
            <Link className="link" to="/reserves">
              <FaRegBookmark className="header-item-icon" />
              <span>Reservas</span>
            </Link>
          </li>
          <li>
            <Link className="link" to="/trips">
              <FaBicycle className="header-item-icon bicycle-icon" />
              <span>Viajes</span>
            </Link>
          </li>
          <li>
            <Link className="link" to="/profile">
              <FaUser className="header-item-icon" />
              <span>Perfil</span>
            </Link>
          </li>
        </ul>
        <ButtonThemeToggle />
      </nav>
    </header>
  );
};
