import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Users, Trophy, CreditCard, Menu, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import  UserAvatar from '../assets/web-profile.png';
import ClubShield from '../assets/club-shield.png';
const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const { logout, userProfile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-[#1a1a1a] w-full">
        <div className="h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-[#FFD700]"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 flex justify-end">
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center space-x-3 text-[#FFD700] hover:text-[#FFC000] focus:outline-none"
              >
                <img
                  //src={userProfile?.avatarUrl}
                  src={ UserAvatar }
                  alt={userProfile?.name}
                  className="h-8 w-8 rounded-full object-cover border-2 border-[#FFD700]"
                />
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium">{userProfile?.name}</div>
                  <div className="text-xs opacity-75">{userProfile?.role}</div>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:pt-16">
        <div className="flex min-h-0 flex-1 flex-col bg-[#1a1a1a]">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-col flex-shrink-0 items-center px-4 text-center">
              <div className="flex items-center justify-center">
                <img
                  src={ClubShield}
                  alt="Club Shield"
                  className="w-[170px] h-[170px] object-contain rounded-full"
                />
              </div>
              <span className=" text-xl font-bold text-[#FFD700]">Sistema de Socion Club Atlético Sarmiento</span>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              <Link
                to="/members"
                className="group flex items-center px-2 py-2 text-sm font-medium text-[#FFD700] hover:bg-[#333333] rounded-md"
              >
                <Users className="mr-3 h-6 w-6" />
                Socios
              </Link>
              <Link
                to="/sports"
                className="group flex items-center px-2 py-2 text-sm font-medium text-[#FFD700] hover:bg-[#333333] rounded-md"
              >
                <Trophy className="mr-3 h-6 w-6" />
                Disciplinas
              </Link>
              <Link
                to="/payments"
                className="group flex items-center px-2 py-2 text-sm font-medium text-[#FFD700] hover:bg-[#333333] rounded-md"
              >
                <CreditCard className="mr-3 h-6 w-6" />
                Cuotas
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-[#1a1a1a] overflow-y-auto">
            <div className="flex flex-col h-full">
              <div className="flex items-center px-4 h-16">
                <Trophy className="h-8 w-8 text-[#FFD700]" />
                <span className="ml-2 text-xl font-bold text-[#FFD700]">Club Manager</span>
              </div>
              <nav className="flex-1 px-2 py-4 space-y-1">
                <Link
                  to="/members"
                  className="flex items-center px-2 py-2 text-base font-medium text-[#FFD700] hover:bg-[#333333] rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="mr-3 h-6 w-6" />
                  Members
                </Link>
                <Link
                  to="/sports"
                  className="flex items-center px-2 py-2 text-base font-medium text-[#FFD700] hover:bg-[#333333] rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Trophy className="mr-3 h-6 w-6" />
                  Sports
                </Link>
                <Link
                  to="/payments"
                  className="flex items-center px-2 py-2 text-base font-medium text-[#FFD700] hover:bg-[#333333] rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CreditCard className="mr-3 h-6 w-6" />
                  Payments
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1 pt-16">
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;