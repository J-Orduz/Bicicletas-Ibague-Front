// components
import { SubHeader } from '@layouts/SubHeader';
import { useAuth } from '@contexts/AuthContext';

// styles
import './Profile.scss';

export const Profile = () => {
  const { logout } = useAuth();

  return (
    <div className="profile-container">
      <SubHeader pageTitle="Perfil de Usuario" />
      <div className="profile-content">
        <h2>Bienvenido usuario</h2>
        <p>Seccion en proceso de desarrollo...</p>
        <button className="logout-button" onClick={logout}>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};
