import { Outlet } from 'react-router-dom';
// components
import { Header } from './Header';

export const MainLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      {/* <Footer /> */}
    </>
  );
};
