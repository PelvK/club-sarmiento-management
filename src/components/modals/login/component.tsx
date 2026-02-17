import { FormEvent, useState } from 'react';
import BackgroundImage from '../../../assets/background-login.jpg';
import ClubShield from '../../../assets/club-shield.png';
import { useNavigate } from 'react-router-dom';
import './login.styles.css';
import { useAuth } from '../../../hooks/useAuth';

export const AuthModal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/members');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="auth-container"
      style={{
        backgroundImage: `url(${BackgroundImage})`
      }}
    >
      <div className="auth-gradient-overlay" />
      
      <div className="auth-content">
        <div className="auth-header">
          <img
            src={ClubShield}
            alt="Club Shield"
            className="auth-shield"
          />
          <h2 className="auth-title">
            Sistema de Gestión<br />Club Atlético Sarmiento
          </h2>
          <p className="auth-subtitle">Ingresa con tu cuenta</p>
        </div>

        {error && (
          <div className="auth-error">
            <p className="auth-error-text">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-group">
            <label htmlFor="email" className="auth-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="tu-email@ejemplo.com"
              required
            />
          </div>

          <div className="auth-form-group">
            <label htmlFor="password" className="auth-label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="Ingresa tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};