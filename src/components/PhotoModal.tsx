import React, { useRef, useState } from 'react';
import Modal from 'react-modal';
import { X, Camera } from 'lucide-react';

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
  name: string;
  documentId: string;
}

const PhotoModal: React.FC<PhotoModalProps> = ({
  isOpen,
  onClose,
  photoUrl,
  name,
  documentId
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [usingBackCamera, setUsingBackCamera] = useState(false);

  const openCamera = async (useBackCamera = false) => {
    try {
      const constraints = useBackCamera
        ? { video: { facingMode: { exact: "environment" } } }
        : { video: true };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setUsingBackCamera(useBackCamera);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      alert("No se pudo acceder a la cámara.");
    }
  };

  const switchToBackCamera = async () => {
    closeCamera();
    await openCamera(true);
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCapturedPhoto(null);
    setUsingBackCamera(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      setCapturedPhoto(dataUrl);
      closeCamera();
    }
  };

  React.useEffect(() => {
    if (!isOpen) closeCamera();
    // eslint-disable-next-line
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Detalles del Afiliado</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-col items-center">
            {capturedPhoto ? (
              <img
                src={capturedPhoto}
                alt="Foto capturada"
                className="w-full max-w-md h-auto rounded-lg shadow-lg mb-4"
              />
            ) : stream ? (
              <div className="flex flex-col items-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-md rounded-lg shadow-lg mb-4"
                />
                <button
                  onClick={capturePhoto}
                  className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 mb-2"
                >
                  <Camera size={20} /> Tomar Foto
                </button>
                <button
                  onClick={closeCamera}
                  className="text-gray-600 underline text-sm"
                >
                  Cancelar
                </button>
                {!usingBackCamera && (
                  <button
                    onClick={switchToBackCamera}
                    className="bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2 mt-2"
                  >
                    Cambiar a Cámara Trasera
                  </button>
                )}
              </div>
            ) : (
              <img
                src={photoUrl}
                alt={name}
                className="w-full max-w-md h-auto rounded-lg shadow-lg mb-4"
              />
            )}
            {!stream && !capturedPhoto && (
              <button
                onClick={() => openCamera(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 mt-2"
              >
                <Camera size={20} /> Usar cámara
              </button>
            )}
            <div className="text-center mt-4">
              <h3 className="text-xl font-semibold text-gray-800">{name}</h3>
              <p className="text-gray-600 mt-2">DNI: {documentId}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PhotoModal;