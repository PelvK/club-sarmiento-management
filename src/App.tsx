import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Members, Sports } from "./pages";
import Payments from "./pages/Payments";
import { AuthProvider } from "./hooks/useAuth";
import { AuthModal } from "./components/modals/AuthModal";
import { ProtectedRoute } from "./pages/ProtectedRoute";
import { RootRedirect } from "./pages/RootRedirect";
import Layout from "./components/Layout";

function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <Layout />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthModal />} />
          <Route path="/" element={<RootRedirect />} />
          
          {/* Rutas protegidas con layout común */}
          <Route element={<ProtectedLayout />}>
            <Route path="/members" element={<Members />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/payments" element={<Payments />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;