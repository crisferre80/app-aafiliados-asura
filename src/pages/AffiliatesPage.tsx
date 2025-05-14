import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAffiliateStore } from '../store/affiliateStore';
import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import { Search, UserPlus, Filter } from 'lucide-react';
import type { Affiliate } from '../types/types';

const AffiliatesPage: React.FC = () => {
  const { affiliates, fetchAffiliates, isLoading } = useAffiliateStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [filteredAffiliates, setFilteredAffiliates] = useState<Affiliate[]>([]);
  
  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);
  
  useEffect(() => {
    // Apply filters
    let result = [...affiliates];
    
    if (showOnlyActive) {
      result = result.filter(a => a.active);
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(a => 
        a.name.toLowerCase().includes(searchLower) || 
        a.document_id.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by name
    result.sort((a, b) => a.name.localeCompare(b.name));
    
    setFilteredAffiliates(result);
  }, [affiliates, searchTerm, showOnlyActive]);
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Afiliados de ASURA- Santiago del Estero</h1>
        <Link to="/affiliates/new">
          <Button variant="primary" className="flex items-center">
            <UserPlus size={18} className="mr-2" />
            Nuevo Afiliado
          </Button>
        </Link>
      </div>
      <img src="https://res.cloudinary.com/dhvrrxejo/image/upload/v1745694849/portada_app_jdttpr.png" alt="Publicidad Econecta" className="h-25 w-40 full bg-white p-0.8 border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500" />
          <h4 className="text-2xl font-bold text-gray-800">DESCARGAR LA APP DE ECONECTA2</h4>
      <Card>
        <CardHeader className="bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search input */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o documento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray 600 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            {/* Filter toggle */}
            <div className="flex items-center">
              <button
                onClick={() => setShowOnlyActive(!showOnlyActive)}
                className={`flex items-center px-3 py-2 rounded-md border ${
                  showOnlyActive 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                <Filter size={18} className="mr-2" />
                {showOnlyActive ? 'Solo Activos' : 'Todos'}
              </button>
            </div>
          </div>
                  
        </CardHeader>
                 
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="w-10 h-10 border-t-4 border-b-4 border-green-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredAffiliates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Afiliado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Afiliación
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAffiliates.map((affiliate) => (
                    <tr 
                      key={affiliate.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/affiliates/${affiliate.id}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {affiliate.photo_url ? (
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={affiliate.photo_url} 
                                alt="" 
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="font-medium text-gray-500">
                                  {affiliate.name.charAt(0)}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {affiliate.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{affiliate.document_id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{affiliate.phone}</div>
                        {affiliate.email && (
                          <div className="text-sm text-gray-500">{affiliate.email}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(affiliate.join_date).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          affiliate.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {affiliate.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No se encontraron afiliados con ese criterio de búsqueda.' : 'No hay afiliados registrados.'}
              </p>
              <Link to="/affiliates/new">
                <Button variant="primary" size="sm" className="inline-flex items-center">
                  <UserPlus size={16} className="mr-2" />
                  Agregar Afiliado
                </Button>
              </Link>
            </div>
          )}
         
        </CardBody>
      </Card>
      
    </div>
  );
};

export default AffiliatesPage;