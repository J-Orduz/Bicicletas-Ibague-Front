// components
import { SubHeader } from '@layouts/SubHeader';
// styles
import './Profile.scss';

export const Profile = () => {
  return (
    <div className="profile-container">
      <SubHeader pageTitle="Perfil de Usuario" />
      <div className="profile-content">
        <h2>Bienvenido usuario</h2>
        <p>Seccion en proceso de desarrollo...</p>
      </div>
    </div>
  );
};
