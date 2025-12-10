import { AppRouter } from './router/AppRouter';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from '@contexts/AuthContext';
import { PreferencesProvider } from '@contexts/PreferencesContext';

import '@styles/main.scss';

function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <AppRouter />
        <ToastContainer position="bottom-right" autoClose={4000} limit={3} />
      </PreferencesProvider>
    </AuthProvider>
  );
}

export default App;
