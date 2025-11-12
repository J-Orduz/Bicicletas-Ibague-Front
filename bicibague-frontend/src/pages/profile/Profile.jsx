import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// components
import { SubHeader } from '@layouts/SubHeader';
// styles
import './Profile.scss';

export const Profile = () => {
  const navigate = useNavigate();

  const hasToken = Boolean(localStorage.getItem('access_token'));

  useEffect(() => {
    if (!hasToken) {
      navigate('/login');
    }
  }, []);

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
