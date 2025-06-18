import React, { createContext, useContext } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, Calendar, LogOut, FileText, UserCog, Download } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const ProvinceContext = createContext({
  selectedProvince: '',
  setSelectedProvince: (_: string) => {},
});

const Layout: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [selectedProvince, setSelectedProvince] = React.useState('Santiago del Estero');
  const { signOut } = useAuthStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const provinces = [
    'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Entre Ríos', 'Salta', 'Chaco', 'Misiones', 'Corrientes',
    'San Juan', 'Jujuy', 'Río Negro', 'Formosa', 'Neuquén', 'San Luis', 'La Rioja', 'Catamarca', 'La Pampa', 'Santa Cruz',
    'Chubut', 'Tierra del Fuego', 'Santiago del Estero', 'Capital Federal'
  ].sort((a, b) => a.localeCompare(b));

  const handleProvinceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(event.target.value);
    // Aquí podrías agregar lógica para filtrar afiliados por provincia
    console.log(`Provincia seleccionada: ${event.target.value}`);
  };

  return (
    <ProvinceContext.Provider value={{ selectedProvince, setSelectedProvince }}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-green-600 text-white shadow-md">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <img src="https://res.cloudinary.com/dhvrrxejo/image/upload/v1744998417/asura_logo_alfa_1_ct0uis.png" alt="ASURA Logo" className="h-10 w-10 rounded-full bg-white p-1" />
              <img src="https://res.cloudinary.com/dhvrrxejo/image/upload/v1744998509/asura_santiago_logo_sj53rh.jpg" alt="Asura logo2" className="h-12 w-17 full bg-white p-0.2" />
              <h1 className="text-xl font-bold">ASURA APP</h1>
            </div>
            {/* Botón MENU en la barra de navegación */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
              >
                MENU
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 bg-white shadow-lg rounded z-50">
                  <nav className="flex flex-col py-2">
                    <NavLink 
                      to="/" 
                      className={({ isActive }) => 
                        `flex items-center space-x-2 px-4 py-3 hover:bg-green-100 transition-colors ${isActive ? 'font-semibold bg-green-200 text-green-800' : 'text-green-600'}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Home size={20} />
                      <span>Inicio</span>
                    </NavLink>
                    <NavLink 
                      to="/affiliates" 
                      className={({ isActive }) => 
                        `flex items-center space-x-2 px-4 py-3 hover:bg-green-100 transition-colors ${isActive ? 'font-semibold bg-green-200 text-green-800' : 'text-green-600'}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Users size={20} />
                      <span>Afiliados</span>
                    </NavLink>
                    <NavLink 
                      to="/payments" 
                      className={({ isActive }) => 
                        `flex items-center space-x-2 px-4 py-3 hover:bg-green-100 transition-colors ${isActive ? 'font-semibold bg-green-200 text-green-800' : 'text-green-600'}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FileText size={20} />
                      <span>Control de Cuotas</span>
                    </NavLink>
                    <NavLink 
                      to="/activities" 
                      className={({ isActive }) => 
                        `flex items-center space-x-2 px-4 py-3 hover:bg-green-100 transition-colors ${isActive ? 'font-semibold bg-green-200 text-green-800' : 'text-green-600'}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Calendar size={20} />
                      <span>Actividades</span>
                    </NavLink>
                    <NavLink
                      to="/comision-directiva"
                      className={({ isActive }) =>
                        `flex items-center space-x-2 px-4 py-3 hover:bg-green-100 transition-colors ${isActive ? 'font-semibold bg-green-200 text-green-800' : 'text-green-600'}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserCog size={20} />
                      <span>Comisión Directiva</span>
                    </NavLink>
                    <NavLink
                      to="/descargas"
                      className={({ isActive }) =>
                        `flex items-center space-x-2 px-4 py-3 hover:bg-green-100 transition-colors ${isActive ? 'font-semibold bg-green-200 text-green-800' : 'text-green-600'}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Download size={20} />
                      <span>Descargas</span>
                    </NavLink>
                    <NavLink 
                      to="/pagos-formulario-ml" 
                      className={({ isActive }) => 
                        `flex items-center space-x-2 px-4 py-3 hover:bg-green-100 transition-colors ${isActive ? 'font-semibold bg-green-200 text-green-800' : 'text-green-600'}`
                      }
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FileText size={20} />
                      <span>Formulario de Pagos</span>
                    </NavLink>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 px-4 py-3 text-left hover:bg-green-100 transition-colors text-green-600"
                    >
                      <LogOut size={20} />
                      <span>Salir</span>
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* Selector de Provincia debajo del header, responsive */}
        <div className="w-full bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center gap-2">
            <label htmlFor="province-selector" className="text-sm font-medium mr-2 text-gray-700">Provincia:</label>
            <select
              id="province-selector"
              value={selectedProvince}
              onChange={e => setSelectedProvince(e.target.value)}
              className="p-2 rounded border border-gray-300 bg-green-50 text-green-800 focus:outline-none focus:ring-2 focus:ring-green-600 w-full sm:w-auto"
            >
              <option value="">Seleccionar...</option>
              {provinces.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>
        </div>
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
    </ProvinceContext.Provider>
  );
};

export default Layout;