import React, { useState } from 'react';
import { usePaymentStore } from '../store/paymentStore';
import Button from './Button';
import { CheckCircle, XCircle, FileDown, Calendar } from 'lucide-react';
import type { Payment, MonthlyPayment } from '../types/types';

interface PaymentListProps {
  profileId: string;
  joinDate: string;
  affiliateName: string;
}

const PaymentList: React.FC<PaymentListProps> = ({ 
  profileId, 
  joinDate, 
  affiliateName 
}) => {
  const { 
    payments, 
    isLoading, 
    fetchPayments, 
    updatePayment, 
    generateMonthlyPayments,
    generatePaymentsPDF 
  } = usePaymentStore();

  const [showAllMonths, setShowAllMonths] = useState(false);

  React.useEffect(() => {
    fetchPayments(profileId);
  }, [profileId, fetchPayments]);

  React.useEffect(() => {
    if (payments.length === 0 && !isLoading) {
      generateMonthlyPayments(profileId, joinDate);
    }
  }, [payments.length, isLoading, generateMonthlyPayments, profileId, joinDate]);

  const handlePaymentStatusChange = async (payment: Payment) => {
    const newStatus = payment.status === 'pending' ? 'paid' : 'pending';
    await updatePayment(payment.id, {
      status: newStatus,
      payment_date: newStatus === 'paid' ? new Date().toISOString() : null,
    });
  };

  const handleDownloadPDF = () => {
    generatePaymentsPDF(profileId, affiliateName);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  // Group payments by year
  const paymentsByYear = payments.reduce((acc, payment) => {
    const year = new Date(payment.due_date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(payment);
    return acc;
  }, {} as Record<number, Payment[]>);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-t-2 border-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Control de Cuotas</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAllMonths(!showAllMonths)}
            className="flex items-center"
          >
            <Calendar size={18} className="mr-2" />
            {showAllMonths ? 'Ver Resumen' : 'Ver Todos los Meses'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadPDF}
            className="flex items-center"
          >
            <FileDown size={18} className="mr-2" />
            Descargar PDF
          </Button>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
        <p className="text-yellow-800">
          <strong>Alias de Pago:</strong> asurasantiago.mp
        </p>
      </div>

      {showAllMonths ? (
        <div className="space-y-6">
          {Object.entries(paymentsByYear).sort(([a], [b]) => Number(b) - Number(a)).map(([year, yearPayments]) => (
            <div key={year} className="bg-white rounded-lg shadow">
              <div className="px-4 py-3 bg-gray-50 rounded-t-lg">
                <h4 className="text-lg font-medium text-gray-900">{year}</h4>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 p-4">
                {yearPayments.map((payment) => (
                  <button
                    key={payment.id}
                    onClick={() => handlePaymentStatusChange(payment)}
                    className={`p-3 rounded-lg text-center transition-colors ${
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    <div className="text-sm font-medium">
                      {new Date(payment.due_date).toLocaleDateString('es-ES', { month: 'short' })}
                    </div>
                    <div className="mt-1">
                      {payment.status === 'paid' ? (
                        <CheckCircle size={16} className="inline" />
                      ) : (
                        <XCircle size={16} className="inline" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Pago
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatDate(payment.due_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.status === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status === 'paid' ? 'Pagado' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {payment.payment_date ? formatDate(payment.payment_date) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button
                      variant={payment.status === 'paid' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => handlePaymentStatusChange(payment)}
                      className="inline-flex items-center"
                    >
                      {payment.status === 'paid' ? (
                        <>
                          <XCircle size={16} className="mr-1" />
                          Marcar como Pendiente
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} className="mr-1" />
                          Marcar como Pagado
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PaymentList;