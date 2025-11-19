import { AppRouter } from './router/AppRouter';
import { AuthProvider } from '@contexts/AuthContext';
import { PreferencesProvider } from '@contexts/PreferencesContext';

import '@styles/main.scss';

function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <AppRouter />
      </PreferencesProvider>
    </AuthProvider>
  );
}

export default App;
