import React, { useState } from 'react';
import Modal from 'react-modal';
import { X, Upload } from 'lucide-react';
import Button from './Button';
import Input from './Input';

interface PaymentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transactionId: string, file: File) => Promise<void>;
  paymentMonth: string;
  amount: number;
}

const PaymentUploadModal: React.FC<PaymentUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  paymentMonth,
  amount
}) => {
  const [transactionId, setTransactionId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!transactionId.trim()) {
      setError('Por favor ingrese el número de operación');
      return;
    }

    if (!file) {
      setError('Por favor seleccione un comprobante');
      return;
    }

    try {
      setIsLoading(true);
      await onSubmit(transactionId, file);
      onClose();
    } catch (error: any) {
      setError(error.message || 'Error al procesar el pago');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4 z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-75"
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Subir Comprobante de Pago</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <p className="text-gray-700">
              <strong>Período:</strong> {paymentMonth}
            </p>
            <p className="text-gray-700">
              <strong>Monto:</strong> ${amount.toLocaleString('es-AR')}
            </p>
          </div>

          <Input
            id="transactionId"
            label="Número de Operación"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Ingrese el número de operación"
            required
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comprobante de Pago
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload size={24} className="mx-auto text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                  >
                    <span>Subir archivo</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">o arrastrar y soltar</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, PDF hasta 5MB
                </p>
              </div>
            </div>
            {file && (
              <p className="mt-2 text-sm text-green-600">
                Archivo seleccionado: {file.name}
              </p>
            )}
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              type="button"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isLoading}
            >
              Confirmar Pago
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentUploadModal;