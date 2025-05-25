import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Users, Calendar, LogOut, FileText, UserCog } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import NotificationBell from './NotificationBell';

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { signOut } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="https://res.cloudinary.com/dhvrrxejo/image/upload/v1744998417/asura_logo_alfa_1_ct0uis.png" alt="ASURA Logo" className="h-10 w-10 rounded-full bg-white p-1" />
            <img src="https://res.cloudinary.com/dhvrrxejo/image/upload/v1744998509/asura_santiago_logo_sj53rh.jpg" alt="Asura logo2" className="h-12 w-17 full bg-white p-0.2" />
            <h1 className="text-xl font-bold">ASURA APP</h1>
          </div>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex items-center space-x-1 hover:text-green-200 transition-colors ${isActive ? 'font-semibold' : ''}`
              }
            >
              <Home size={20} />
              <span>Inicio</span>
            </NavLink>
            <NavLink 
              to="/affiliates" 
              className={({ isActive }) => 
                `flex items-center space-x-1 hover:text-green-200 transition-colors ${isActive ? 'font-semibold' : ''}`
              }
            >
              <Users size={20} />
              <span>Afiliados</span>
            </NavLink>
            <NavLink 
              to="/payments" 
              className={({ isActive }) => 
                `flex items-center space-x-1 hover:text-green-200 transition-colors ${isActive ? 'font-semibold' : ''}`
              }
            >
              <FileText size={20} />
              <span>Control de Cuotas</span>
            </NavLink>
            <NavLink 
              to="/activities" 
              className={({ isActive }) => 
                `flex items-center space-x-1 hover:text-green-200 transition-colors ${isActive ? 'font-semibold' : ''}`
              }
            >
              <Calendar size={20} />
              <span>Actividades</span>
            </NavLink>
            <NavLink 
              to="/comision-directiva"
              className={({ isActive }) =>
                `flex items-center space-x-1 hover:text-green-200 transition-colors ${isActive ? 'font-semibold' : ''}`
              }
            >
              <UserCog size={20} />
              <span>Comisión Directiva</span>
            </NavLink>
            <NotificationBell />
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-1 hover:text-green-200 transition-colors"
            >
              <LogOut size={20} />
              <span>Salir</span>
            </button>
          </nav>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-green-600 text-white shadow-lg">
          <nav className="flex flex-col py-2">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `flex items-center space-x-2 px-4 py-3 hover:bg-green-700 transition-colors ${isActive ? 'font-semibold bg-green-700' : ''}`
              }
              onClick={closeMenu}
            >
              <Home size={20} />
              <span>Inicio</span>
            </NavLink>
            <NavLink 
              to="/affiliates" 
              className={({ isActive }) => 
                `flex items-center space-x-2 px-4 py-3 hover:bg-green-700 transition-colors ${isActive ? 'font-semibold bg-green-700' : ''}`
              }
              onClick={closeMenu}
            >
              <Users size={20} />
              <span>Afiliados</span>
            </NavLink>
            <NavLink 
              to="/payments" 
              className={({ isActive }) => 
                `flex items-center space-x-2 px-4 py-3 hover:bg-green-700 transition-colors ${isActive ? 'font-semibold bg-green-700' : ''}`
              }
              onClick={closeMenu}
            >
              <FileText size={20} />
              <span>Control de Cuotas</span>
            </NavLink>
            <NavLink 
              to="/activities" 
              className={({ isActive }) => 
                `flex items-center space-x-2 px-4 py-3 hover:bg-green-700 transition-colors ${isActive ? 'font-semibold bg-green-700' : ''}`
              }
              onClick={closeMenu}
            >
              <Calendar size={20} />
              <span>Actividades</span>
            </NavLink>
            <NavLink
              to="/comision-directiva"
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-3 hover:bg-green-700 transition-colors ${isActive ? 'font-semibold bg-green-700' : ''}`
              }
              onClick={closeMenu}
            >
              <UserCog size={20} />
              <span>Comisión Directiva</span>
            </NavLink>
            <button
              onClick={() => {
                handleSignOut();
                closeMenu();
              }}
              className="flex items-center space-x-2 px-4 py-3 text-left hover:bg-green-700 transition-colors"
            >
              <LogOut size={20} />
              <span>Salir</span>
            </button>
          </nav>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-grow">
        <div className="container mx-auto p-4">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© 2025 ASURA - Asociación Sindical Unica de Recicladores Argentinos. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;