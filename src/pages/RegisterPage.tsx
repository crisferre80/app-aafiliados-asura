import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Input from '../components/Input';
import Button from '../components/Button';
import { RecycleIcon, ArrowLeft } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { signUp, error, user, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setFormError('Por favor complete todos los campos');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      await signUp(email, password, fullName);
    } catch (error) {
      // Error is handled in the store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 animate-fadeIn">
        <button 
          onClick={() => navigate('/login')}
          className="mb-4 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} className="mr-1" />
          Volver al inicio de sesión
        </button>

        <div className="text-center mb-8">
          <div className="flex justify-center">
            <div className="bg-green-100 p-3 rounded-full">
              <RecycleIcon size={40} className="text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mt-4">Registro ASURA</h1>
          <p className="text-gray-600">Crea tu cuenta para acceder al sistema</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="fullName"
            label="Nombre Completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <Input
            id="email"
            label="Correo Electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

          <Input
            id="confirmPassword"
            label="Confirmar Contraseña"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {(error || formError) && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error || formError}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            Crear Cuenta
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Sistema de Gestión de Afiliados</p>
          <p className="mt-1">© 2025 ASURA</p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;