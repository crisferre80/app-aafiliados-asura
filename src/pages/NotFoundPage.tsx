import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { Home } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-lg">
        <h1 className="text-9xl font-bold text-green-600">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">Página no encontrada</h2>
        <p className="text-gray-600 mt-2">
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>
        <div className="mt-6">
          <Link to="/">
            <Button variant="primary" className="flex items-center mx-auto">
              <Home size={18} className="mr-2" />
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;