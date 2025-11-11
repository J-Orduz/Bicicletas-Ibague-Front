import { Outlet } from 'react-router-dom';
// components
import { Header } from './Header';
// styles
import './MainLayout.scss';

export const MainLayout = () => {
  return (
    <>
      <Header />
      <main className='main-container'>
        <Outlet />
      </main>
      {/* <Footer /> */}
    </>
  );
};
