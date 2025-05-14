import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useActivityStore } from '../store/activityStore';
import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import { Search, PlusCircle, Calendar } from 'lucide-react';
import type { Activity } from '../types/types';

const ActivitiesPage: React.FC = () => {
  const { activities, fetchActivities, isLoading } = useActivityStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);
  
  useEffect(() => {
    // Apply filters
    let result = [...activities];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(a => 
        a.title.toLowerCase().includes(searchLower) || 
        a.description.toLowerCase().includes(searchLower) ||
        a.location.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by date descending
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setFilteredActivities(result);
  }, [activities, searchTerm]);
  
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Actividades</h1>
        <Link to="/activities/new">
          <Button variant="primary" className="flex items-center">
            <PlusCircle size={18} className="mr-2" />
            Nueva Actividad
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader className="bg-gray-50">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar actividad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </CardHeader>
        
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <div className="w-10 h-10 border-t-4 border-b-4 border-green-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredActivities.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {filteredActivities.map((activity) => (
                <li key={activity.id} className="hover:bg-gray-50 transition-colors">
                  <Link to={`/activities/${activity.id}`} className="block p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {activity.image_url ? (
                          <img 
                            src={activity.image_url} 
                            alt={activity.title} 
                            className="h-20 w-20 rounded-md object-cover shadow-sm"
                          />
                        ) : (
                          <div className="h-20 w-20 bg-gray-200 rounded-md flex items-center justify-center">
                            <Calendar size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-medium text-gray-900">{activity.title}</h2>
                          <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{activity.description}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span>Ubicación: {activity.location}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">
                {searchTerm ? 'No se encontraron actividades con ese criterio de búsqueda.' : 'No hay actividades registradas.'}
              </p>
              <Link to="/activities/new">
                <Button variant="primary" size="sm" className="inline-flex items-center">
                  <PlusCircle size={16} className="mr-2" />
                  Agregar Actividad
                </Button>
              </Link>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default ActivitiesPage;