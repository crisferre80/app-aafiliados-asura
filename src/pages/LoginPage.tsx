import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Input from '../components/Input';
import Button from '../components/Button';
import { RecycleIcon } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { signIn, error, user, isLoading } = useAuthStore();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setFormError('Por favor ingrese su email y contraseña');
      return;
    }
    
    try {
      await signIn(email, password);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const handlePasswordReset = () => {
    // TODO: Implement password reset functionality
    console.log('Password reset clicked');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-x5 max-w-md w-full p-8 animate-fadeIn">
        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="border rounded p-2 ">
              <img src="https://res.cloudinary.com/dhvrrxejo/image/upload/v1744998509/asura_santiago_logo_sj53rh.jpg" alt="ASURA Logo inicio" className="h-13 w-13 full " />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">ASURA</h1>
          <p className="text-gray-600">Asociación Sindical Unica de Recicladores Argentinos</p>
          <p className="text-gray-1000">Santiago del Estero</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="directiva@asura.org"
            required
          />
          
          <Input
            id="password"
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {(error || formError) && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm">
              {error || formError}
            </div>
          )}
          
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            className="mt-2"
          >
            Ingresar
          </Button>
        </form>

        <div className="mt-6 flex flex-col items-center space-y-4">
          <button
            onClick={handlePasswordReset}
            className="text-sm text-green-600 hover:text-green-700 transition-colors"
          >
            ¿Olvidaste tu contraseña? Recupérala
          </button>

          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">¿No tienes una cuenta?</span>
            <Link
              to="/register"
              className="text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              Regístrate
            </Link>
          </div>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Sistema de Gestión de Afiliados</p>
          <p className="mt-1">© 2025 ASURA</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;