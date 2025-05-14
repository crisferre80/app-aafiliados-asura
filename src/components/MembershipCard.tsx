import React from 'react';
import QRCode from 'qrcode';
import type { Affiliate } from '../types/types';

interface MembershipCardProps {
  affiliate: Affiliate;
  cardNumber: string;
  validThrough: string;
  printable?: boolean;
}

const MembershipCard: React.FC<MembershipCardProps> = ({
  affiliate,
  cardNumber,
  validThrough,
  printable = false
}) => {
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('');

  React.useEffect(() => {
    const generateQRCode = async () => {
      try {
        const cardData = {
          id: affiliate.id,
          name: affiliate.name,
          cardNumber,
          validThrough,
          timestamp: new Date().toISOString(),
        };

        const url = await QRCode.toDataURL(JSON.stringify(cardData), {
          width: 300,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'H',
        });

        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [affiliate, cardNumber, validThrough]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const cardStyle = printable ? {
    width: '10cm',
    height: '6.5cm',
    pageBreakInside: 'avoid',
    backgroundColor: 'white'
  } as React.CSSProperties : {};

  return (
    <div 
      className={`rounded-lg shadow-lg overflow-hidden mx-auto ${printable ? '' : 'max-w-md'}`}
      style={cardStyle}
    >
      <div className="bg-green-600 p-2">
        <div className="flex items-center justify-between">
          <img
            src="https://res.cloudinary.com/dhvrrxejo/image/upload/v1744998417/asura_logo_alfa_1_ct0uis.png"
            alt="ASURA Logo"
            className="h-8 w-8"
          />
          <div className="text-white text-right">
            <h2 className="text-sm font-bold">ASURA</h2>
            <p className="text-xs">Carnet de Afiliado</p>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-center space-x-2">
          {affiliate.photo_url ? (
            <img
              src={affiliate.photo_url}
              alt={affiliate.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-green-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-50">
              <span className="text-xl font-bold text-green-600">
                {affiliate.name.charAt(0)}
              </span>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-800 truncate">{affiliate.name}</h3>
            <p className="text-xs text-gray-600">DNI: {affiliate.document_id}</p>
            <p className="text-xs text-gray-500">
              Afiliado desde: {formatDate(affiliate.join_date)}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-gray-500">Número de Carnet</p>
              <p className="font-mono text-gray-800">{cardNumber}</p>
            </div>
            <div>
              <p className="text-gray-500">Válido hasta</p>
              <p className="font-mono text-gray-800">{formatDate(validThrough)}</p>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-1">
          {qrCodeUrl && (
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-20 h-20"
            />
          )}
        </div>

        <div className="text-center text-xs text-gray-500">
          <p>Escanee el código QR para verificar la membresía</p>
        </div>
      </div>

      <div className="bg-gray-50 px-3 py-1">
        <div className="text-center text-[8px] text-gray-500">
          <p>ASURA - Asociación Sindical Única de Recicladores Argentinos</p>
          <p>Santiago del Estero</p>
        </div>
      </div>
    </div>
  );
};

export default MembershipCard;