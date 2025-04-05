import React, { useState } from 'react';
import type { User } from '../types';
import BackgroundImage from '../assets/background-login.jpg'
import ClubShield from '../assets/club-shield.png' 

interface AuthModalProps {
  onLogin: (credentials: User) => Promise<boolean>;
  error: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLogin, error }) => {
  const [credentials, setCredentials] = useState<User>({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(credentials);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
         style={{
           backgroundImage: `url(${BackgroundImage})`,
           backgroundSize: 'cover',
           backgroundPosition: 'center'
         }}>
      <div className="bg-black bg-opacity-70 absolute inset-0" />
      
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-8 relative">
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="flex items-center justify-center">
            <img
              src={ClubShield}
              alt="Club Shield"
              className="w-[170px] h-[170px] object-contain rounded-full"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sistema de Gestión Club Atlético Sarmiento</h2>
          <p className="text-gray-600 mt-1">Ingresa con tu cuenta</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FFD700] focus:ring focus:ring-[#FFD700] focus:ring-opacity-50"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#FFD700] text-black py-2 px-4 rounded-md hover:bg-[#FFC000] transition-colors font-medium"
          >
            Sign In
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Demo credentials:</p>
          <p>Email: admin@club.com</p>
          <p>Password: admin123</p>
        </div>
      </div>
    </div>
  );
};