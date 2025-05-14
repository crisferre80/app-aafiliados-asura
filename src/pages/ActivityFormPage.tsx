import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useActivityStore } from '../store/activityStore';
import Card, { CardHeader, CardBody, CardFooter } from '../components/Card';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import { ArrowLeft, Save, Upload, Camera, X } from 'lucide-react';

const ActivityFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const { activities, addActivity, updateActivity, uploadImage, isLoading, fetchActivities } = useActivityStore();
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Load activity data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const activity = activities.find(a => a.id === id);
      
      if (!activity && activities.length === 0) {
        // Try fetching activities if not loaded yet
        fetchActivities();
        return;
      }
      
      if (activity) {
        setTitle(activity.title);
        setDescription(activity.description);
        setDate(new Date(activity.event_date).toISOString().split('T')[0]);
        setLocation(activity.location);
        setImageUrl(activity.image_url);
        setPreviewUrl(activity.image_url);
      } else {
        // Activity not found
        navigate('/activities');
      }
    }
  }, [id, activities, isEditMode, navigate, fetchActivities]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) newErrors.title = 'El título es requerido';
    if (!description.trim()) newErrors.description = 'La descripción es requerida';
    if (!date) newErrors.date = 'La fecha es requerida';
    if (!location.trim()) newErrors.location = 'La ubicación es requerida';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageChanged(true);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      // Clean up previous object URL
      return () => URL.revokeObjectURL(objectUrl);
    }
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  
  const removeImage = () => {
    setPreviewUrl(null);
    setImageUrl(null);
    setImageChanged(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    let finalImageUrl = imageUrl;
    
    // Handle image upload if changed
    if (imageChanged && fileInputRef.current?.files?.[0]) {
      finalImageUrl = await uploadImage(fileInputRef.current.files[0]);
    }
    
    const activityData = {
      title,
      description,
      event_date: date,
      location,
      image_url: finalImageUrl,
    };
    
    try {
      if (isEditMode && id) {
        await updateActivity(id, activityData);
      } else {
        await addActivity(activityData);
      }
      // Redirect to activities page after successful save
      navigate('/activities');
    } catch (error) {
      console.error('Error saving activity:', error);
      setErrors({ submit: 'Error al guardar la actividad' });
    }
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
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Editar Actividad' : 'Nueva Actividad'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <Card>
          <CardBody className="space-y-6">
            <Input
              id="title"
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              error={errors.title}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="date"
                label="Fecha"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                error={errors.date}
                required
              />
              
              <Input
                id="location"
                label="Ubicación"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                error={errors.location}
                required
              />
            </div>
            
            <TextArea
              id="description"
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              required
              rows={5}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen
              </label>
              
              {previewUrl ? (
                <div className="relative inline-block">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full max-w-md h-auto object-cover rounded-lg border border-gray-300" 
                  />
                  <button 
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <Button 
                  type="button"
                  onClick={handleUploadClick}
                  variant="outline"
                  className="flex items-center"
                >
                  <Upload size={18} className="mr-2" />
                  Subir Imagen
                </Button>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {errors.submit && (
              <div className="text-red-600 text-sm">{errors.submit}</div>
            )}
          </CardBody>
          
          <CardFooter className="flex justify-between">
            <Link to="/activities">
              <Button variant="outline">
                Cancelar
              </Button>
            </Link>
            
            <Button 
              type="submit" 
              variant="primary"
              isLoading={isLoading}
              className="flex items-center"
            >
              <Save size={18} className="mr-2" />
              {isEditMode ? 'Actualizar' : 'Guardar'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
};

export default ActivityFormPage;