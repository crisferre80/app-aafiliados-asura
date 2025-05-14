import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useActivityStore } from '../store/activityStore';
import Card, { CardHeader, CardBody, CardFooter } from '../components/Card';
import Button from '../components/Button';
import { ArrowLeft, Edit, Calendar, MapPin } from 'lucide-react';
import type { Activity } from '../types/types';

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activities, fetchActivities, isLoading } = useActivityStore();
  const [activity, setActivity] = useState<Activity | null>(null);
  
  useEffect(() => {
    // Try to find activity in store
    const foundActivity = activities.find(a => a.id === id);
    
    if (foundActivity) {
      setActivity(foundActivity);
    } else if (activities.length === 0) {
      // If no activities loaded yet, fetch them
      fetchActivities();
    } else {
      // If activities loaded but this one not found, redirect
      navigate('/activities');
    }
  }, [id, activities, fetchActivities, navigate]);
  
  // When activities are loaded, find the current one
  useEffect(() => {
    if (!activity && activities.length > 0 && id) {
      const foundActivity = activities.find(a => a.id === id);
      if (foundActivity) {
        setActivity(foundActivity);
      } else {
        navigate('/activities');
      }
    }
  }, [activities, activity, id, navigate]);
  
  if (!activity) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-16 h-16 border-t-4 border-b-4 border-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }
  
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
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Detalle de Actividad</h1>
      </div>
      
      <Card>
        <CardHeader className="flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">{activity.title}</h2>
          
          <Link to={`/activities/${id}/edit`}>
            <Button variant="secondary" className="flex items-center">
              <Edit size={18} className="mr-2" />
              Editar
            </Button>
          </Link>
        </CardHeader>
        
        <CardBody>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Image section */}
            <div className="lg:col-span-1">
              {activity.image_url ? (
                <img 
                  src={activity.image_url} 
                  alt={activity.title} 
                  className="w-full rounded-lg shadow-md object-cover"
                />
              ) : (
                <div className="bg-gray-200 rounded-lg w-full aspect-video flex items-center justify-center">
                  <span className="text-gray-400">Sin imagen</span>
                </div>
              )}
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center text-gray-700">
                  <Calendar size={20} className="mr-2 text-green-600" />
                  <span className="font-medium">Fecha:</span>
                  <span className="ml-2">{formatDate(activity.date)}</span>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <MapPin size={20} className="mr-2 text-green-600" />
                  <span className="font-medium">Ubicación:</span>
                  <span className="ml-2">{activity.location}</span>
                </div>
              </div>
            </div>
            
            {/* Description section */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Descripción
              </h3>
              
              <p className="text-gray-700 whitespace-pre-line">{activity.description}</p>
            </div>
          </div>
        </CardBody>
        
        <CardFooter className="bg-gray-50">
          <Link to="/activities">
            <Button variant="outline">
              Volver a Actividades
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ActivityDetailPage;