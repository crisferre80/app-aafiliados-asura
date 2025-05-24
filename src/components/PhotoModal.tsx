import React from 'react';
import Modal from 'react-modal';
import { X } from 'lucide-react';

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
            <img
              src={photoUrl}
              alt={name}
              className="w-full max-w-md h-auto rounded-lg shadow-lg mb-4"
            />
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