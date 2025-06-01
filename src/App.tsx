import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Members from './pages/Members';
import Sports from './pages/Sports';
import Payments from './pages/Payments';
import { AuthModal } from './components/modals/AuthModal';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, error, login } = useAuth();

  if (!isAuthenticated) {
    return <AuthModal onLogin={login} error={error} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/members" replace />} />
          <Route path="members" element={<Members />} />
          <Route path="sports" element={<Sports />} />
          <Route path="payments" element={<Payments />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;