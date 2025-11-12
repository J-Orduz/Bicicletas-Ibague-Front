import { AppRouter } from './router/AppRouter';
import { AuthProvider } from '@contexts/AuthContext';

import '@styles/main.scss';

function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
