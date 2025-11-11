// components
import { Header } from '@layouts/Header';
// styles
import './notFound.scss';

export const NotFound = () => {
  return (
    <>
      <Header />
      <main className="notfound-container">
        <h1>404 - Página no encontrada</h1>
        <p>Lo sentimos, la página que buscas no existe.</p>
      </main>
    </>
  );
};
