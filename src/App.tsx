import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Members, Sports, Users } from "./pages";
import Payments from "./pages/Payments";
import { AuthProvider } from "./hooks/useAuth";
import { AuthModal } from "./components/modals/login";
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
          <Route element={<ProtectedLayout />}>
            <Route path="/members" element={<Members />} />
            <Route
              path="/sports"
              element={
                <ProtectedRoute requireAdmin>
                  <Sports />
                </ProtectedRoute>
              }
            />

            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              }
            />

            <Route
              path="/users"
              element={
                <ProtectedRoute requireAdmin>
                  <Users />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
