import React from 'react';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Payment } from '../types/types';

interface PaymentCalendarProps {
  payments: Payment[];
  joinDate: string;
}

const PaymentCalendar: React.FC<PaymentCalendarProps> = ({ payments, joinDate }) => {
  const tileClassName = ({ date }: { date: Date }) => {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const payment = payments.find(p => {
      const paymentDate = new Date(p.due_date);
      return paymentDate.getFullYear() === date.getFullYear() && 
             paymentDate.getMonth() === date.getMonth();
    });

    const classes = ['h-full', 'w-full', 'p-2', 'rounded-lg'];
    
    // Current month
    if (date.getMonth() === new Date().getMonth() && 
        date.getFullYear() === new Date().getFullYear()) {
      classes.push('border-2 border-green-500');
    }

    // Month with pending payment
    if (payment?.status === 'pending') {
      classes.push('bg-red-100');
    }

    // Month with paid payment
    if (payment?.status === 'paid') {
      classes.push('bg-green-100');
    }

    // Future months
    if (date > new Date()) {
      classes.push('bg-gray-50');
    }

    // Months before join date
    if (new Date(joinDate) > monthStart) {
      classes.push('opacity-50');
    }

    return classes.join(' ');
  };

  const tileContent = ({ date }: { date: Date }) => {
    const payment = payments.find(p => {
      const paymentDate = new Date(p.due_date);
      return paymentDate.getFullYear() === date.getFullYear() && 
             paymentDate.getMonth() === date.getMonth();
    });

    if (!payment) return null;

    return (
      <div className="text-xs mt-1">
        {payment.status === 'paid' ? '✓ Pagado' : '! Pendiente'}
      </div>
    );
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <Calendar
        locale="es"
        value={new Date()}
        tileClassName={tileClassName}
        tileContent={tileContent}
        formatMonthYear={(locale, date) => 
          format(date, 'MMMM yyyy', { locale: es })
        }
      />
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
          <span>Cuota Pendiente</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-100 rounded mr-2"></div>
          <span>Cuota Pagada</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-50 rounded mr-2"></div>
          <span>Meses Futuros</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 border-2 border-green-500 rounded mr-2"></div>
          <span>Mes Actual</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentCalendar;