/* eslint-disable react-refresh/only-export-components */
import { Payment } from '../types/types';
import { usePaymentStore } from '../store/paymentStore'; // Asegúrate de importar tu store


export const createPaymentLocal = async (
  data: Omit<Payment, 'id'>,
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>
): Promise<Payment> => {
  // Si tienes backend, aquí harías una petición POST
  // Por ejemplo:
  // const response = await api.post('/payments', data);
  // const newPayment = response.data;

  // Si es local, puedes simularlo así:
  const newPayment: Payment = {
    ...data,
    id: Math.random().toString(36).substr(2, 9), // Genera un id temporal
  };
  setPayments((payments) => [...payments, newPayment]);
  return newPayment;
};

// ...exporta createPayment en tu store...

// Example usage inside a React component:
import React from 'react';

type Affiliate = {
  id: string;
  // agrega aquí otros campos si es necesario
};

export const CreatePaymentExample: React.FC<{ affiliate: Affiliate; dueDate: string }> = ({ affiliate, dueDate }) => {
  const { createPayment } = usePaymentStore();

  const handleCreatePayment = async () => {
    await createPayment({
      profile_id: affiliate.id,
      due_date: dueDate,
      amount: 7000,
      status: 'pending',
      // ...otros campos necesarios...
    });
  };

  return (
    <button onClick={handleCreatePayment}>
      Create Payment
    </button>
  );
};