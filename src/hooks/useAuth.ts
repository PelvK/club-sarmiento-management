import { useState, useCallback } from 'react';
import type { User, UserProfile } from '../types';

// Hardcoded credentials for now
const VALID_CREDENTIALS = {
  email: 'admin@club.com',
  password: 'admin123'
};

// Hardcoded user profile
const USER_PROFILE: UserProfile = {
  name: 'John Admin',
  email: 'admin@club.com',
  role: 'Administrator',
  avatarUrl: '../assets/web-profile.webp'
};

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const login = useCallback(async (credentials: User) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      if (
        credentials.email === VALID_CREDENTIALS.email &&
        credentials.password === VALID_CREDENTIALS.password
      ) {
        setIsAuthenticated(true);
        setUserProfile(USER_PROFILE);
        setError(null);
        return true;
      }

      throw new Error('Invalid credentials');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUserProfile(null);
    setError(null);
  }, []);

  return {
    isAuthenticated,
    error,
    userProfile,
    login,
    logout
  };
}