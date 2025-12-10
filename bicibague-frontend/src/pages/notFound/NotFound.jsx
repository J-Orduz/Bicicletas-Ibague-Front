import { useTranslation } from 'react-i18next';
// components
import { Header } from '@layouts/Header';
// styles
import './notFound.scss';

export const NotFound = () => {
  const { t } = useTranslation();
  
  return (
    <>
      <Header />
      <main className="notfound-container">
        <h1>{t('notFound.title')}</h1>
        <p>{t('notFound.message')}</p>
      </main>
    </>
  );
};
