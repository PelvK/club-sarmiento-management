import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Users,
  Trophy,
  CreditCard,
  Menu,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import UserAvatar from "../assets/web-profile.png";
import ClubShield from "../assets/club-shield.png";

const Layout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-[#1a1a1a] flex-col fixed inset-y-0 z-40">
        <div className="flex flex-col flex-1 overflow-y-auto pt-5 pb-4">
          <div className="flex flex-col items-center px-4 mt-10 text-center">
            <img
              src={ClubShield}
              alt="Club Shield"
              className="w-[170px] h-[170px] object-contain rounded-full"
            />
            <span className="text-xl font-bold text-[#FFD700] mt-4">
              Sistema de Socios Club Atlético Sarmiento
            </span>
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-2">
            <Link
              to="/members"
              className="group flex items-center px-2 py-2 text-sm font-medium text-[#FFD700] hover:bg-[#333333] rounded-md"
            >
              <Users className="mr-3 h-6 w-6" />
              Socios
            </Link>
            {user?.is_admin && (
              <Link
                to="/sports"
                className="group flex items-center px-2 py-2 text-sm font-medium text-[#FFD700] hover:bg-[#333333] rounded-md"
              >
                <Trophy className="mr-3 h-6 w-6" />
                Disciplinas
              </Link>
            )}
            <Link
              to="/payments"
              className="group flex items-center px-2 py-2 text-sm font-medium text-[#FFD700] hover:bg-[#333333] rounded-md"
            >
              <CreditCard className="mr-3 h-6 w-6" />
              Cuotas
            </Link>
            {user?.is_admin && (
              <Link
                to="/users"
                className="group flex items-center px-2 py-2 text-sm font-medium text-[#FFD700] hover:bg-[#333333] rounded-md"
              >
                <Users className="mr-3 h-6 w-6" />
                Usuarios
              </Link>
            )}
          </nav>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 md:pl-56 mt-8">
        {/* Topbar */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-[#1a1a1a] h-16 flex items-center justify-between px-4 md:pl-64 md:pr-6">
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
                  src={UserAvatar}
                  alt={user?.username}
                  className="h-8 w-8 rounded-full object-cover border-2 border-[#FFD700]"
                />
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium">{user?.username}</div>
                  <div className="text-xs opacity-75">
                    {user?.is_admin ? "Admin" : "User"}
                  </div>
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
        </header>

        {/* Main content with scroll */}
        <main className="flex-1 pt-11 overflow-y-auto overflow-x-auto bg-slate-100">
          <div className="py-6 min-h-full">
            <div className="mx-12 max-w-full px-12 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      {/* Mobile sidebar */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-[#1a1a1a] overflow-y-auto z-50">
            <div className="flex flex-col h-full">
              <div className="flex items-center px-4 h-16">
                <Trophy className="h-8 w-8 text-[#FFD700]" />
                <span className="ml-2 text-xl font-bold text-[#FFD700]">
                  Club Manager
                </span>
              </div>
              <nav className="flex-1 px-2 py-4 space-y-1">
                <Link
                  to="/members"
                  className="flex items-center px-2 py-2 text-base font-medium text-[#FFD700] hover:bg-[#333333] rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="mr-3 h-6 w-6" />
                  Socios
                </Link>
                <Link
                  to="/sports"
                  className="flex items-center px-2 py-2 text-base font-medium text-[#FFD700] hover:bg-[#333333] rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Trophy className="mr-3 h-6 w-6" />
                  Disciplinas
                </Link>
                <Link
                  to="/payments"
                  className="flex items-center px-2 py-2 text-base font-medium text-[#FFD700] hover:bg-[#333333] rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CreditCard className="mr-3 h-6 w-6" />
                  Cuotas
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
