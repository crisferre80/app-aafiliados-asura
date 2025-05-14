import React from 'react';
import type { Affiliate } from '../types/types';
import { Printer } from 'lucide-react';
import ReactDOM from 'react-dom/client';
import Button from './Button';
import MembershipCard from './MembershipCard';

interface AffiliatePrintCardProps {
  affiliate: Affiliate;
}

const AffiliatePrintCard: React.FC<AffiliatePrintCardProps> = ({ affiliate }) => {
  const handlePrint = () => {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    // Render the card
    const card = document.createElement('div');
    container.appendChild(card);

    // Use ReactDOM to render the card
    const root = ReactDOM.createRoot(card);
    root.render(
      <MembershipCard
        affiliate={affiliate}
        cardNumber={`ASURA-${new Date().getFullYear()}-${affiliate.document_id}`}
        validThrough={new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()}
        printable={true}
      />
    );

    // Wait for images to load
    setTimeout(() => {
      window.print();
      document.body.removeChild(container);
    }, 500);
  };
  
  return (
    <Button
      onClick={handlePrint}
      variant="outline"
      className="flex items-center"
    >
      <Printer size={18} className="mr-2" />
      Imprimir Credencial
    </Button>
  );
};

export default AffiliatePrintCard;