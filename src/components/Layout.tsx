import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Users,
  Trophy,
  CreditCard,
  Menu,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
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

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center px-4 py-3 text-sm font-medium rounded-l-xl transition-all duration-200
     ${
       isActive
         ? "bg-slate-100 text-[#1a1a1a] shadow-md border-l-4 border-[#FFD700]"
         : "text-[#FFD700] hover:bg-[#2a2a2a]"
     }`;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:flex-shrink-0 w-64 bg-[#1a1a1a] flex-col fixed inset-y-0 z-40 border-r border-[#2a2a2a]">
        <div className="flex flex-col flex-1 overflow-y-auto pt-5 pb-4">
          <div className="flex flex-col items-center px-4 mt-10 text-center">
            <img
              src={ClubShield}
              alt="Club Shield"
              className="w-[170px] h-[170px] object-contain rounded-full flex items-center justify-center"
            />
            <span className="text-xl font-bold text-[#FFD700] mt-4">
              Sistema de Socios Club Atlético Sarmiento
            </span>
          </div>

          <nav className="mt-8 flex-1 space-y-2 pl-2">
            <NavLink to="/members" className={navItemClass}>
              <Users className="mr-3 h-6 w-6" />
              Socios
            </NavLink>

            {user?.is_admin && (
              <NavLink to="/sports" className={navItemClass}>
                <Trophy className="mr-3 h-6 w-6" />
                Disciplinas
              </NavLink>
            )}

            <NavLink to="/payments" className={navItemClass}>
              <CreditCard className="mr-3 h-6 w-6" />
              Cuotas
            </NavLink>

            {user?.is_admin && (
              <NavLink to="/users" className={navItemClass}>
                <Users className="mr-3 h-6 w-6" />
                Usuarios
              </NavLink>
            )}
          </nav>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Topbar */}
        <header className="fixed top-0 left-0 right-0 z-40 bg-[#1a1a1a] h-16 flex items-center justify-between px-4 md:pl-64 md:pr-6">
          {/* Hamburger - móvil */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#FFD700] md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Spacer para desktop (empuja el perfil a la derecha) */}
          <div className="hidden md:block flex-1" />

          {/* Profile menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-3 text-[#FFD700] hover:text-[#FFC000] focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center border-2 border-[#FFD700]">
                <Users className="h-4 w-4 text-[#1a1a1a]" />
              </div>
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
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 pt-16 overflow-x-hidden overflow-y-auto bg-slate-100">
          <div className="py-6 px-4 sm:px-6 lg:px-8 w-full max-w-[100vw] md:max-w-[calc(100vw-16rem)]">
            <Outlet />
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
              {/* Header del sidebar móvil */}
              <div className="flex items-center px-4 h-16 border-b border-[#2a2a2a]">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center border-2 border-[#FFD700]">
                  <Users className="h-4 w-4 text-[#1a1a1a]" />
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-[#FFD700]">{user?.username}</div>
                  <div className="text-xs text-[#FFD700] opacity-75">
                    {user?.is_admin ? "Admin" : "User"}
                  </div>
                </div>
              </div>

              {/* Nav links */}
              <nav className="flex-1 px-2 py-4 space-y-2 pb-8">
                <NavLink
                  to="/members"
                  className={navItemClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Users className="mr-3 h-6 w-6" />
                  Socios
                </NavLink>

                {user?.is_admin && (
                  <NavLink
                    to="/sports"
                    className={navItemClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Trophy className="mr-3 h-6 w-6" />
                    Disciplinas
                  </NavLink>
                )}

                <NavLink
                  to="/payments"
                  className={navItemClass}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CreditCard className="mr-3 h-6 w-6" />
                  Cuotas
                </NavLink>

                {user?.is_admin && (
                  <NavLink
                    to="/users"
                    className={navItemClass}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Users className="mr-3 h-6 w-6" />
                    Usuarios
                  </NavLink>
                )}
              </nav>

              {/* Logout en el fondo */}
              <div className="px-2 pb-6 border-t border-[#2a2a2a] pt-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-3 text-sm font-medium text-[#FFD700] hover:bg-[#2a2a2a] rounded-l-xl"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;