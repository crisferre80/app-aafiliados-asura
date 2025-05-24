import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAffiliateStore } from '../store/affiliateStore';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Affiliate {
  id: string;
  name: string;
  photo_url?: string | null;
  document_id?: string;
  address?: string;
  join_date?: string;
  // Add other fields as needed
}

const AffiliateCredential: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { affiliates } = useAffiliateStore();
  const credentialRef = useRef<HTMLDivElement>(null);

  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);

  useEffect(() => {
    const foundAffiliate = affiliates.find((a) => a.id === id);
    setAffiliate(foundAffiliate || null);
  }, [id, affiliates]);

  if (!affiliate) {
    return <div>Afiliado no encontrado</div>;
  }

  const handleDownloadPDF = async () => {
    if (!credentialRef.current) return;
    try {
      const canvas = await html2canvas(credentialRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', [100, 60]);
      pdf.addImage(imgData, 'PNG', 0, 0, 100, 60);
      pdf.save(`credencial_${affiliate.name}.pdf`);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        padding: '50px',
      }}
    >
      {/* Credencial */}
      <div
        ref={credentialRef}
        style={{
          width: '10cm',
          height: '6cm',
          borderRadius: '12px',
          boxShadow: '0 4px 8px rgba(28, 124, 36, 0.2)',
          backgroundColor: '#ffffff',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          backgroundImage: `url('https://res.cloudinary.com/dhvrrxejo/image/upload/v1747190043/Dise%C3%B1o_sin_t%C3%ADtulo_5_y20v3e.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ position: 'absolute', top: '10px', left: '320px' }}>
          <img
            src="https://res.cloudinary.com/dhvrrxejo/image/upload/v1744998417/asura_logo_alfa_1_ct0uis.png"
            alt="Logo Asura"
            style={{ width: '50px' }}
          />
        </div>

        {/* Foto de perfil y nombre */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginTop: '4px',
            padding: '0 13px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
          }}
        >
          <img
            src={
              affiliate.photo_url && affiliate.photo_url !== ''
                ? affiliate.photo_url
                : 'https://via.placeholder.com/80'
            }
            alt={affiliate.name}
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'cover',
              borderRadius: '50%',
              border: '2px solid #ddd',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          />
          <div
            style={{
              marginTop: '10px',
              textAlign: 'center',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            <h2
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                margin: 0,
                color: '#333',
              }}
            >
              {affiliate.name}
            </h2>
          </div>
        </div>

        {/* Información del afiliado */}
        <div
          style={{
            padding: '11px',
            fontSize: '12px',
            color: '#111',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '8px',
            marginTop: '10px',
          }}
        >
          <p style={{ margin: '5px 0' }}>
            <strong>DNI:</strong> {affiliate.document_id || '—'}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Dirección:</strong> {affiliate.address || '—'}
          </p>
          <p style={{ margin: '5px 0' }}>
            <strong>Fecha de Afiliación:</strong> {affiliate.join_date || '—'}
          </p>
        </div>

        {/* Pie de la tarjeta */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '0.1px',
            fontSize: '10px',
            color: '#333',
          }}
        >
          © 2025 Asura. Todos los derechos reservados.
        </div>
      </div>

      {/* Botón para imprimir */}
      <button
        onClick={handlePrint}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#28a745',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        Imprimir Credencial
      </button>

      {/* Botón para descargar PDF */}
      <button
        onClick={handleDownloadPDF}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          backgroundColor: '#ff5722',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        Descargar PDF
      </button>

      {/* Botón para volver */}
      <button
        onClick={() => navigate(-1)}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        Volver
      </button>
    </div>
  );
};

export default AffiliateCredential;