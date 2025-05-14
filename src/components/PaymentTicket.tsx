import React from 'react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import type { Payment } from '../types/types';
import { FileDown } from 'lucide-react';
import Button from './Button';

interface PaymentTicketProps {
  payment: Payment;
  affiliateName: string;
}

const PaymentTicket: React.FC<PaymentTicketProps> = ({ payment, affiliateName }) => {
  const generatePaymentTicket = async () => {
    const doc = new jsPDF();
    
    // Generate QR code with Mercado Pago link
    const mpLink = `https://link.mercadopago.com.ar/asurasantiago.mp`;
    const qrCodeUrl = await QRCode.toDataURL(mpLink);
    
    // Add ASURA logo
    doc.addImage(
      'https://res.cloudinary.com/dhvrrxejo/image/upload/v1744998417/asura_logo_alfa_1_ct0uis.png',
      'PNG',
      10,
      10,
      30,
      30
    );
    
    // Add header
    doc.setFontSize(20);
    doc.text('ASURA - Comprobante de Pago', 50, 25);
    doc.setFontSize(12);
    doc.text('Santiago del Estero', 50, 35);
    
    // Add payment details
    const startY = 50;
    const lineHeight = 10;
    let currentY = startY;

    const addField = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 80, currentY);
      currentY += lineHeight;
    };

    addField('Afiliado', affiliateName);
    addField('Período', new Date(payment.due_date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    }));
    addField('Monto', new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(payment.amount));
    addField('Vencimiento', new Date(payment.due_date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
    addField('Estado', payment.status === 'paid' ? 'Pagado' : 'Pendiente');

    // Add payment instructions
    currentY += 10;
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.text('Instrucciones de Pago', 20, currentY);
    currentY += lineHeight;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('1. Escanee el código QR con su aplicación de Mercado Pago', 20, currentY);
    currentY += lineHeight;
    doc.text('2. Alias de pago: asurasantiago.mp', 20, currentY);
    currentY += lineHeight;

    // Add QR code
    doc.addImage(qrCodeUrl, 'PNG', 70, currentY, 70, 70);
    currentY += 80;

    // Add footer
    doc.setFontSize(10);
    doc.text('ASURA - Asociación Sindical Única de Recicladores Argentinos', 20, currentY);
    doc.text('Santiago del Estero', 20, currentY + 5);
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, 20, currentY + 10);
    
    // Save the PDF
    const period = new Date(payment.due_date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long'
    });
    doc.save(`cuota-${period}-${affiliateName.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };
  
  return (
    <Button
      onClick={generatePaymentTicket}
      variant="outline"
      className="flex items-center"
    >
      <FileDown size={18} className="mr-2" />
      Generar Comprobante
    </Button>
  );
};

export default PaymentTicket;