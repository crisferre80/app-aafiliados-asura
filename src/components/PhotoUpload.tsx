import React, { useState, useRef } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import Webcam from 'react-webcam';
import Button from './Button';

interface PhotoUploadProps {
  onPhotoCapture: (photoFile: File) => void;
  currentPhotoUrl?: string | null;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ 
  onPhotoCapture, 
  currentPhotoUrl
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentPhotoUrl || null);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const capturePhoto = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setPhotoPreview(imageSrc);
        setShowCamera(false);
        
        // Convert base64 to file object
        fetch(imageSrc)
          .then(res => res.blob())
          .then(blob => {
            const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
            onPhotoCapture(file);
          });
      }
    }
  }, [webcamRef, onPhotoCapture]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPhotoPreview(objectUrl);
      onPhotoCapture(file);
      
      // Clean up
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
            className="w-40 h-40 object-cover rounded-lg border border-gray-300" 
          />
          <button 
            onClick={removePhoto}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
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
            videoConstraints={{ facingMode: "user" }}
            className="w-full max-w-md rounded-lg border border-gray-300 mb-2"
          />
          <div className="flex space-x-2">
            <Button 
              onClick={capturePhoto} 
              variant="primary"
            >
              Tomar Foto
            </Button>
            <Button 
              onClick={() => setShowCamera(false)} 
              variant="outline"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setShowCamera(true)}
            variant="outline"
            className="flex items-center"
          >
            <Camera size={18} className="mr-2" />
            Tomar Foto
          </Button>
          
          <Button 
            onClick={handleUploadClick}
            variant="outline"
            className="flex items-center"
          >
            <Upload size={18} className="mr-2" />
            Subir Foto
          </Button>
          
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