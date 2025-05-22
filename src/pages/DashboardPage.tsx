import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAffiliateStore } from '../store/affiliateStore';
import { useActivityStore } from '../store/activityStore';
import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import { Users, Calendar, UserPlus, PlusCircle } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { affiliates, fetchAffiliates, isLoading: affiliatesLoading } = useAffiliateStore();
  const { activities, fetchActivities, isLoading: activitiesLoading } = useActivityStore();
  
  useEffect(() => {
    fetchAffiliates();
    fetchActivities();
  }, [fetchAffiliates, fetchActivities]);
  
  // Get active affiliates count
  const activeAffiliatesCount = affiliates.filter(a => a.active).length;
  
  // Get recent activities (last 3)
  const recentActivities = activities.slice(0, 3);
  
  // Get recent affiliates (last 5)
  const recentAffiliates = [...affiliates]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  
  // Format date for display
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Control de Usuario Autenticado de ASURA</h1>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="transform transition-transform hover:scale-105">
          <CardBody className="flex items-center">
            <div className="bg-blue-100 p-4 rounded-full mr-4">
              <Users size={32} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Afiliados Activos</h2>
              {affiliatesLoading ? (
                <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-3xl font-bold text-blue-600">{activeAffiliatesCount}</p>
              )}
            </div>
            <div className="ml-auto">
              <Link to="/affiliates">
                <Button variant="secondary" size="sm">Ver todos</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
        
        <Card className="transform transition-transform hover:scale-105">
          <CardBody className="flex items-center">
            <div className="bg-green-100 p-4 rounded-full mr-4">
              <Calendar size={32} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Actividades Proximas de ASURA </h2>
              {activitiesLoading ? (
                <div className="h-6 w-12 bg-gray-200 animate-pulse rounded"></div>
              ) : (
                <p className="text-3xl font-bold text-green-600">{activities.length}</p>
              )}
            </div>
            <div className="ml-auto">
              <Link to="/activities">
                <Button variant="secondary" size="sm">Ver todas</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Affiliates */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Afiliados Recientes</h2>
            <Link to="/affiliates/new">
              <Button variant="primary" size="sm" className="flex items-center">
                <UserPlus size={16} className="mr-1" />
                <span>Nuevo</span>
              </Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {affiliatesLoading ? (
              <div className="p-6 flex justify-center">
                <div className="w-6 h-6 border-t-2 border-green-500 rounded-full animate-spin"></div>
              </div>
            ) : recentAffiliates.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentAffiliates.map(affiliate => (
                  <li key={affiliate.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <Link to={`/affiliates/${affiliate.id}`} className="flex items-center">
                      <div className="flex-shrink-0">
                        {affiliate.photo_url ? (
                          <img 
                            src={affiliate.photo_url} 
                            alt={affiliate.name} 
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 font-medium">
                              {affiliate.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-700">{affiliate.name}</p>
                        <p className="text-sm text-gray-500">Unido el {formatDate(affiliate.join_date)}</p>
                      </div>
                      <div className="ml-auto">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          affiliate.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {affiliate.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No hay afiliados registrados
              </div>
            )}
          </CardBody>
        </Card>
        
        {/* Recent Activities */}
        <Card>
          <CardHeader className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Actividades Recientes</h2>
            <Link to="/activities/new">
              <Button variant="primary" size="sm" className="flex items-center">
                <PlusCircle size={16} className="mr-1" />
                <span>Nueva</span>
              </Button>
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {activitiesLoading ? (
              <div className="p-6 flex justify-center">
                <div className="w-6 h-6 border-t-2 border-green-500 rounded-full animate-spin"></div>
              </div>
            ) : recentActivities.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentActivities.map(activity => (
                  <li key={activity.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <Link to={`/activities/${activity.id}`} className="flex">
                      <div className="flex-shrink-0">
                        {activity.image_url ? (
                          <img 
                            src={activity.image_url} 
                            alt={activity.title} 
                            className="h-16 w-16 rounded object-cover"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded bg-gray-200 flex items-center justify-center">
                            <Calendar size={24} className="text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-gray-700">{activity.title}</p>
                        <p className="text-sm text-gray-500">{formatDate(activity.date)}</p>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">{activity.description}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-6 text-center text-gray-500">
                No hay actividades registradas
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;