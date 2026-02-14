import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthResponse, UserPermissions } from '../lib/types/auth';
import { BASE_API_URL } from '../lib/utils/strings';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  permissions: UserPermissions;
  isAdmin: boolean;
  isActive: boolean;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  canAccessSport: (sportId: number) => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const DEFAULT_PERMISSIONS: UserPermissions = {
  can_add: false,
  can_edit: false,
  can_delete: false,
  can_view: false,
  can_manage_payments: false,
  can_generate_reports: false,
  can_toggle_activate: false,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = `${BASE_API_URL}` || 'http://localhost/apis';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  console.log('user', user);

  // Computed values
  const permissions = user?.permissions || DEFAULT_PERMISSIONS;
  const isAdmin = user?.is_admin || false;
  const isActive = user?.is_active || false;

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('session_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth.php`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

            console.log('Session check response:', response);

      if (!response.ok) {
        localStorage.removeItem('session_token');
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      if (!data.user.is_active) {
        localStorage.removeItem('session_token');
        setUser(null);
        setLoading(false);
        throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
      }

      setUser(data.user);
    } catch (error) {
      console.error('Error checking session:', error);
      localStorage.removeItem('session_token');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'login',
        email,
        password,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data: AuthResponse = await response.json();
    
    // Verificar si el usuario está activo
    if (!data.user.is_active) {
      throw new Error('Tu cuenta está desactivada. Contacta al administrador.');
    }

    localStorage.setItem('session_token', data.session.access_token);
    setUser(data.user);
  };

  const signUp = async (email: string, password: string, username: string) => {
    const response = await fetch(`${API_URL}/auth.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'register',
        email,
        password,
        username,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const data: AuthResponse = await response.json();
    localStorage.setItem('session_token', data.session.access_token);
    setUser(data.user);
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem('session_token');
      if (token) {
        await fetch(`${API_URL}/auth.php`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      localStorage.removeItem('session_token');
      setUser(null);
    } catch (error) {
      localStorage.removeItem('session_token');
      setUser(null);
      throw error;
    }
  };

  /**
   * Verifica si el usuario tiene un permiso específico
   * Los admins tienen todos los permisos por defecto
   */
  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!user) return false;
    if (user.is_admin) return true; // Admins tienen todos los permisos
    return permissions[permission] || false;
  };

  /**
   * Verifica si el usuario tiene acceso a un deporte específico
   * Los admins tienen acceso a todos los deportes
   */
  const canAccessSport = (sportId: number): boolean => {
    if (!user) return false;
    if (user.is_admin) return true; // Admins tienen acceso a todos
    
    if (!user.sport_supported || user.sport_supported.length === 0) {
      return false; // Sin deportes asignados
    }

    return user.sport_supported.some(sport => sport.id === sportId);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        permissions,
        isAdmin,
        isActive,
        hasPermission,
        canAccessSport,
        signIn, 
        signUp, 
        signOut 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
