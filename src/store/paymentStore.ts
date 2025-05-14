import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { Payment, PaymentVerification } from '../types/types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PaymentState {
  payments: Payment[];
  isLoading: boolean;
  error: string | null;
  fetchPayments: (profileId: string) => Promise<void>;
  updatePayment: (id: string, updates: Partial<Payment>) => Promise<void>;
  verifyPayment: (verification: PaymentVerification) => Promise<void>;
  generateMonthlyPayments: (profileId: string, startDate: string) => Promise<void>;
  generatePaymentsPDF: (profileId: string, affiliateName: string) => Promise<void>;
  generateConsolidatedPDF: () => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  isLoading: false,
  error: null,

  fetchPayments: async (profileId: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('profile_id', profileId)
        .order('due_date', { ascending: true });

      if (error) throw error;
      set({ payments: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updatePayment: async (id: string, updates: Partial<Payment>) => {
    try {
      set({ isLoading: true, error: null });
      
      // Add verification metadata if payment is being marked as paid
      if (updates.status === 'paid') {
        const { data: { user } } = await supabase.auth.getUser();
        updates = {
          ...updates,
          payment_date: new Date().toISOString(),
          verified_by: user?.id,
          verification_date: new Date().toISOString()
        };
      }

      const { error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      const payments = get().payments.map(p => 
        p.id === id ? { ...p, ...updates } : p
      );
      
      set({ payments, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  verifyPayment: async (verification: PaymentVerification) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updates = {
        status: 'paid',
        transaction_id: verification.transaction_id,
        verification_notes: verification.verification_notes,
        payment_date: new Date().toISOString(),
        verified_by: user.id,
        verification_date: new Date().toISOString()
      };

      const { error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', verification.payment_id);

      if (error) throw error;

      const payments = get().payments.map(p => 
        p.id === verification.payment_id ? { ...p, ...updates } : p
      );
      
      set({ payments, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  generateMonthlyPayments: async (profileId: string, startDate: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error: fnError } = await supabase
        .rpc('generate_monthly_payments', {
          affiliate_id: profileId,
          start_date: startDate,
          amount: 7000
        });

      if (fnError) throw fnError;

      await get().fetchPayments(profileId);
      
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  generatePaymentsPDF: async (profileId: string, affiliateName: string) => {
    try {
      const payments = get().payments;
      const doc = new jsPDF();

      // Add header
      doc.setFontSize(20);
      doc.text('ASURA - Resumen de Pagos', 20, 20);
      
      // Add affiliate info
      doc.setFontSize(12);
      doc.text(`Afiliado: ${affiliateName}`, 20, 30);
      doc.text('Alias de Pago: asurasantiago.mp', 20, 40);
      
      // Add current date
      const currentDate = new Date().toLocaleDateString('es-AR');
      doc.text(`Fecha de emisión: ${currentDate}`, 20, 50);

      // Create table
      const tableData = payments.map(payment => [
        new Date(payment.due_date).toLocaleDateString('es-AR'),
        `$${payment.amount.toLocaleString('es-AR')}`,
        payment.status === 'paid' ? 'Pagado' : 'Pendiente',
        payment.payment_date ? new Date(payment.payment_date).toLocaleDateString('es-AR') : '-',
        payment.transaction_id || '-',
        payment.verification_date ? new Date(payment.verification_date).toLocaleDateString('es-AR') : '-'
      ]);

      (doc as any).autoTable({
        startY: 60,
        head: [['Vencimiento', 'Monto', 'Estado', 'Fecha de Pago', 'ID Transacción', 'Verificación']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 163, 74] }
      });

      // Add total amount
      const totalPending = payments
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);

      doc.text(`Total Adeudado: $${totalPending.toLocaleString('es-AR')}`, 20, doc.internal.pageSize.height - 20);

      // Save the PDF
      doc.save(`pagos-${affiliateName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  generateConsolidatedPDF: async () => {
    try {
      set({ isLoading: true, error: null });

      // Fetch all affiliates and their payments
      const { data: affiliates, error: affiliatesError } = await supabase
        .from('affiliates')
        .select(`
          id,
          name,
          document_id,
          payments (*)
        `)
        .order('name');

      if (affiliatesError) throw affiliatesError;

      const doc = new jsPDF();

      // Add header
      doc.setFontSize(20);
      doc.text('ASURA - Reporte Consolidado de Pagos', 20, 20);
      
      // Add current date
      doc.setFontSize(12);
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}`, 20, 30);

      // Create table data
      const tableData = affiliates?.map(affiliate => {
        const payments = affiliate.payments || [];
        const pendingAmount = payments
          .filter((p: Payment) => p.status === 'pending')
          .reduce((sum: number, p: Payment) => sum + p.amount, 0);
        const pendingMonths = payments.filter((p: Payment) => p.status === 'pending').length;

        return [
          affiliate.document_id,
          affiliate.name,
          pendingMonths.toString(),
          `$${pendingAmount.toLocaleString('es-AR')}`,
          payments.length > 0 ? 
            new Date(payments[payments.length - 1].payment_date || '').toLocaleDateString('es-AR') : 
            '-'
        ];
      });

      (doc as any).autoTable({
        startY: 40,
        head: [['DNI', 'Nombre', 'Meses Adeudados', 'Monto Total', 'Último Pago']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 163, 74] }
      });

      // Add summary
      const totalPending = affiliates?.reduce((sum, affiliate) => {
        const pendingAmount = (affiliate.payments || [])
          .filter((p: Payment) => p.status === 'pending')
          .reduce((pSum: number, p: Payment) => pSum + p.amount, 0);
        return sum + pendingAmount;
      }, 0);

      doc.text(
        `Total General Adeudado: $${totalPending?.toLocaleString('es-AR')}`,
        20,
        doc.internal.pageSize.height - 20
      );

      // Save the PDF
      doc.save('reporte-consolidado-pagos.pdf');
      
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  }
}));