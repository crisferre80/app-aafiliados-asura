import React, { useState, useRef } from 'react';
import { Camera, Upload, X, RefreshCcw } from 'lucide-react';
import Webcam from 'react-webcam';

interface PhotoUploadProps {
  onPhotoCapture: (photoFile: File, cameraType: 'user' | 'environment') => void;
  currentPhotoUrl?: string | null;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  onPhotoCapture, 
  currentPhotoUrl
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentPhotoUrl || null);
  const [cameraType, setCameraType] = useState<'user' | 'environment'>('user');
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capturePhoto = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setPhotoPreview(imageSrc);
        setShowCamera(false);
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            onPhotoCapture(file, cameraType);
          });
      }
    }
  }, [webcamRef, onPhotoCapture, cameraType]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
      onPhotoCapture(file, cameraType);
      return () => URL.revokeObjectURL(objectUrl);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Botón de alternancia de cámara, solo se muestra cuando showCamera es true
  const CameraSwitchButton = (
    <button
      type="button"
      onClick={() => setCameraType(prev => prev === 'user' ? 'environment' : 'user')}
      className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
      title={`Cambiar a cámara ${cameraType === 'user' ? 'trasera' : 'frontal'}`}
    >
      <RefreshCcw size={20} className="animate-spin-slow" />
      {cameraType === 'user' ? 'Frontal' : 'Trasera'}
    </button>
  );

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Fotografía
      </label>
      
      {photoPreview ? (
        <div className="relative inline-block">
          <img 
            src={photoPreview} 
            alt="Preview" 
            className="w-40 h-40 object-cover rounded-lg border-2 border-green-400 shadow-lg transition-all duration-300"
          />
          <button 
            onClick={removePhoto}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 hover:scale-110 transition-all"
            title="Eliminar foto"
          >
            <X size={16} />
          </button>
        </div>
      ) : showCamera ? (
        <div className="mb-4">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: cameraType }}
            className="w-full max-w-md rounded-lg border-2 border-blue-400 shadow-lg mb-2 transition-all duration-300"
          />
          <div className="flex space-x-2">
            <button
              onClick={capturePhoto}
              className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white shadow-md hover:bg-green-700 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <Camera size={18} />
              Tomar Foto
            </button>
            <button
              onClick={() => setShowCamera(false)}
              className="flex items-center gap-2 px-4 py-2 rounded bg-gray-200 text-gray-700 shadow-md hover:bg-gray-300 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Cancelar
            </button>
            {CameraSwitchButton}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowCamera(true)}
            className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Camera size={18} className="mr-2" />
            Tomar Foto
          </button>
          <button
            onClick={handleUploadClick}
            className="flex items-center gap-2 px-4 py-2 rounded bg-gray-200 text-gray-700 shadow-md hover:bg-gray-300 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Upload size={18} className="mr-2" />
            Subir Foto
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;

// Agrega esta clase a tu CSS global si quieres animar el ícono de refresco lentamente:
// .animate-spin-slow { animation: spin 2s linear infinite; }
// @keyframes spin { 100% { transform: rotate(360deg); } }