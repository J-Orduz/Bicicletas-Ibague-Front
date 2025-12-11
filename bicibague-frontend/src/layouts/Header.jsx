import { Link } from 'react-router-dom';
// hooks
import { useScrollDirection } from '@hooks/useScrollDirection';
import { useAuth } from '@contexts/AuthContext';
import { useTranslation } from 'react-i18next';
// components
import { ButtonThemeToggle } from '@components/ButtonThemeToggle';
// icons
import {
  FaUser,
  FaRegMap,
  FaRegBookmark,
  FaBicycle,
  FaFile,
} from 'react-icons/fa6';
// styles
import './Header.scss';
import logo from '/logo_bicibague.png';

export const Header = () => {
  const scrollDirection = useScrollDirection();
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <header
      className={`header ${scrollDirection === 'down' ? 'header--hidden' : ''}`}
    >
      <div className="header-logo">
        <img src={logo} alt="BicIbagué Logo" />
        <h1>BicIbagué</h1>
      </div>
      <nav>
        <ul>
          <li>
            <Link className="link" to="/">
              <FaRegMap className="header-item-icon map-icon" />
              <span>{t('nav.map')}</span>
            </Link>
          </li>
          <li>
            <Link className="link" to="/reserves">
              <FaRegBookmark className="header-item-icon" />
              <span>{t('nav.reserves')}</span>
            </Link>
          </li>
          <li>
            <Link className="link" to="/trips">
              <FaBicycle className="header-item-icon bicycle-icon" />
              <span>{t('nav.trips')}</span>
            </Link>
          </li>
          {user?.rol === 'admin' && (
            <li>
              <Link className="link" to="/reports">
                <FaFile className="header-item-icon" />
                <span>{t('nav.reports')}</span>
              </Link>
            </li>
          )}
          <li>
            <Link className="link" to="/profile">
              <FaUser className="header-item-icon" />
              <span>{t('nav.profile')}</span>
            </Link>
          </li>
        </ul>
        <ButtonThemeToggle />
      </nav>
    </header>
  );
};
