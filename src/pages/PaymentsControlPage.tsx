import React, { useEffect, useState } from 'react';
import { useAffiliateStore } from '../store/affiliateStore';
import { usePaymentStore } from '../store/paymentStore';
import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Search, Download, ArrowUpDown, Filter, Calendar } from 'lucide-react';
import type { Payment, Affiliate } from '../types/types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import QRCode from 'qrcode';

interface AffiliatePaymentStatus {
  affiliateId: string;
  memberNumber: string;
  name: string;
  status: 'Al día' | 'Adeuda';
  pendingMonths: number;
  totalAmount: number;
  lastPaymentDate: string | null;
}

interface PaymentFilter {
  status: 'all' | 'pending' | 'paid';
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
}

const PaymentsControlPage: React.FC = () => {
  const { affiliates, fetchAffiliates } = useAffiliateStore();
  const { payments, fetchPayments, updatePayment } = usePaymentStore();
  const [paymentStatus, setPaymentStatus] = useState<AffiliatePaymentStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PaymentFilter>({
    status: 'all',
    period: 'monthly',
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof AffiliatePaymentStatus;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filteredStatus, setFilteredStatus] = useState<AffiliatePaymentStatus[]>([]);

  useEffect(() => {
    fetchAffiliates();
  }, [fetchAffiliates]);

  useEffect(() => {
    const fetchAllPayments = async () => {
      for (const affiliate of affiliates) {
        await fetchPayments(affiliate.id);
      }
    };
    
    if (affiliates.length > 0) {
      fetchAllPayments();
    }
  }, [affiliates, fetchPayments]);

  useEffect(() => {
    const calculatePaymentStatus = () => {
      const status: AffiliatePaymentStatus[] = affiliates.map((affiliate, index) => {
        const affiliatePayments = payments.filter(p => p.profile_id === affiliate.id);
        const pendingPayments = affiliatePayments.filter(p => p.status === 'pending');
        const totalAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
        const lastPayment = affiliatePayments
          .filter(p => p.status === 'paid')
          .sort((a, b) => new Date(b.payment_date!).getTime() - new Date(a.payment_date!).getTime())[0];

        return {
          affiliateId: affiliate.id,
          memberNumber: `${index + 1}`.padStart(4, '0'),
          name: affiliate.name,
          status: pendingPayments.length > 0 ? 'Adeuda' : 'Al día',
          pendingMonths: pendingPayments.length,
          totalAmount,
          lastPaymentDate: lastPayment?.payment_date || null
        };
      });

      setPaymentStatus(status);
    };

    calculatePaymentStatus();
  }, [affiliates, payments]);

  useEffect(() => {
    let result = [...paymentStatus];

    // Apply filters
    if (filters.status !== 'all') {
      result = result.filter(status => 
        filters.status === 'pending' ? status.status === 'Adeuda' : status.status === 'Al día'
      );
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(status =>
        status.name.toLowerCase().includes(searchLower) ||
        status.memberNumber.includes(searchLower)
      );
    }

    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredStatus(result);
  }, [paymentStatus, searchTerm, filters, sortConfig]);

  const handleSort = (key: keyof AffiliatePaymentStatus) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.text('ASURA - Control de Cuotas', 20, 20);
    
    // Add current date
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, 20, 30);

    // Create table
    const tableData = filteredStatus.map(status => [
      status.memberNumber,
      status.name,
      status.status,
      status.pendingMonths.toString(),
      formatCurrency(status.totalAmount),
      formatDate(status.lastPaymentDate)
    ]);

    (doc as any).autoTable({
      startY: 40,
      head: [['N° Afiliado', 'Nombre', 'Estado', 'Meses Adeudados', 'Monto Total', 'Último Pago']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 163, 74] }
    });

    // Add summary
    const totalDebt = filteredStatus.reduce((sum, status) => sum + status.totalAmount, 0);
    const totalDebtors = filteredStatus.filter(status => status.status === 'Adeuda').length;

    doc.setFontSize(12);
    doc.text(`Total de Deudores: ${totalDebtors}`, 20, doc.internal.pageSize.height - 30);
    doc.text(`Monto Total Adeudado: ${formatCurrency(totalDebt)}`, 20, doc.internal.pageSize.height - 20);

    // Save the PDF
    doc.save('control-cuotas.pdf');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Control de Cuotas</h1>
        <div className="flex gap-2">
          <Button
            onClick={exportToPDF}
            variant="primary"
            className="flex items-center"
          >
            <Download size={18} className="mr-2" />
            Exportar a PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gray-50">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar por nombre o número de afiliado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value as PaymentFilter['status'] }))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Con deuda</option>
                <option value="paid">Al día</option>
              </select>

              <select
                value={filters.period}
                onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value as PaymentFilter['period'] }))}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="monthly">Mensual</option>
                <option value="quarterly">Trimestral</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    { key: 'memberNumber', label: 'N° Afiliado' },
                    { key: 'name', label: 'Nombre y Apellido' },
                    { key: 'status', label: 'Estado' },
                    { key: 'pendingMonths', label: 'Meses Adeudados' },
                    { key: 'totalAmount', label: 'Monto Total' },
                    { key: 'lastPaymentDate', label: 'Último Pago' }
                  ].map(({ key, label }) => (
                    <th
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort(key as keyof AffiliatePaymentStatus)}
                    >
                      <div className="flex items-center">
                        {label}
                        <ArrowUpDown size={14} className="ml-1" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStatus.map((status) => (
                  <tr key={status.affiliateId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {status.memberNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {status.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        status.status === 'Al día'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {status.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {status.pendingMonths}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(status.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(status.lastPaymentDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-800 mb-2">Información de Pago</h3>
        <p className="text-yellow-800">
          <strong>Alias de Pago:</strong> asurasantiago.mp
        </p>
        <p className="text-yellow-800 mt-2">
          <strong>Cuota Mensual:</strong> {formatCurrency(7000)}
        </p>
      </div>
    </div>
  );
};

export default PaymentsControlPage;