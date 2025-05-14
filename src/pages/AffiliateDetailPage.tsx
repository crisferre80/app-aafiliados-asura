import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAffiliateStore, deleteAffiliate } from '../store/affiliateStore';
import { usePaymentStore } from '../store/paymentStore';
import Card, { CardHeader, CardBody } from '../components/Card';
import Button from '../components/Button';
import PaymentTicket from '../components/PaymentTicket';
import PaymentCalendar from '../components/PaymentCalendar';
import PhotoModal from '../components/PhotoModal';
import PaymentUploadModal from '../components/PaymentUploadModal';
import { ArrowLeft, Edit, UserCheck, UserMinus, FileText, Download, Trash2, ExternalLink } from 'lucide-react';
import type { Affiliate, Payment } from '../types/types';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const AffiliateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { affiliates, fetchAffiliates, updateAffiliate, isLoading } = useAffiliateStore();
  const { payments, fetchPayments, updatePayment } = usePaymentStore();
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  // Removed unused currentPayment state
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  // Removed unused localIsLoading state
  // Removed unused paymentLink state

  useEffect(() => {
    const foundAffiliate = affiliates.find((a) => a.id === id);

    if (foundAffiliate) {
      setAffiliate(foundAffiliate);
      fetchPayments(foundAffiliate.id);
      
      QRCode.toDataURL(`${window.location.origin}/affiliates/${foundAffiliate.id}`)
        .then(url => setQrCodeUrl(url))
        .catch(err => console.error('QR Code generation failed:', err));
    } else if (affiliates.length === 0) {
      fetchAffiliates();
    } else {
      navigate('/affiliates');
    }
  }, [id, affiliates, fetchAffiliates, navigate, fetchPayments]);

  useEffect(() => {
    if (payments.length > 0) {
      const pendingPayment = payments.find((p) => p.status === 'pending');
      setSelectedPayment(pendingPayment || null);
    }
  }, [payments]);

  const createPayment = async () => {
    try {
      const preference = {
        items: [
          {
            title: 'Cuota de Afiliación',
            quantity: 1,
            currency_id: 'ARS',
            unit_price: 1000, // Monto de la transacción
          },
        ],
        payer: {
          email: affiliate?.email || 'test_user@example.com',
        },
        back_urls: {
          success: `${window.location.origin}/success`,
          failure: `${window.location.origin}/failure`,
          pending: `${window.location.origin}/pending`,
        },
        auto_return: 'approved',
      };

      console.log('Payment preference created:', preference); // Use the preference object

      

      // Generar el código QR
      const paymentUrl = `${window.location.origin}/payments/${affiliate?.id}`;
      const qrCode = await QRCode.toDataURL(paymentUrl);
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error('Error al crear la preferencia de pago:', error);
    }
  };

  useEffect(() => {
    if (affiliate) {
      createPayment();
    }
  }, [affiliate]);

  if (!affiliate) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-16 h-16 border-t-4 border-b-4 border-green-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleToggleActive = async () => {
    if (id) {
      await updateAffiliate(id, { active: !affiliate.active });
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteAffiliate(id); // Llama a la función del store
      setShowDeleteConfirm(false); // Cierra el modal
      navigate('/affiliates'); // Redirige al usuario
    } catch (error: any) {
      console.error('Error al eliminar el afiliado:', error.message || error);
      alert(`Ocurrió un error al intentar eliminar el afiliado: ${error.message || 'Error desconocido'}`);
    }
  };

  const handlePhotoClick = () => {
    setShowPhotoModal(true);
  };

  const handlePaymentUpload = async (transactionId: string, file: File) => {
    if (!selectedPayment) return;

    try {
      await updatePayment(selectedPayment.id, {
        status: 'paid',
        transaction_id: transactionId,
        payment_date: new Date().toISOString(),
        verification_notes: `Comprobante subido: ${file.name}`
      });

      setShowPaymentModal(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Error uploading payment:', error);
      throw new Error('Error al procesar el pago');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No especificado';

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getMaritalStatusText = (status: string | null | undefined) => {
    const statusMap: Record<string, string> = {
      'single': 'Soltero/a',
      'married': 'Casado/a',
      'divorced': 'Divorciado/a',
      'widowed': 'Viudo/a',
      'domestic_partnership': 'Unión de hecho',
    };
    return status ? statusMap[status] || status : 'No especificado';
  };

  const getEducationLevelText = (level: string | null) => {
    const levelMap: Record<string, string> = {
      'none': 'Sin estudios',
      'primary_incomplete': 'Primario incompleto',
      'primary_complete': 'Primario completo',
      'secondary_incomplete': 'Secundario incompleto',
      'secondary_complete': 'Secundario completo',
      'tertiary_incomplete': 'Terciario/Universitario incompleto',
      'tertiary_complete': 'Terciario/Universitario completo'
    };
    return level ? levelMap[level] || level : 'No especificado';
  };

  const getEmploymentTypeText = (type: string | null) => {
    const typeMap: Record<string, string> = {
      'formal': 'Empleado formal',
      'informal': 'Empleado informal',
      'unemployed': 'Desempleado',
      'retired': 'Jubilado',
      'temporary': 'Trabajo temporal',
      'other': 'Otro'
    };
    return type ? typeMap[type] || type : 'No especificado';
  };

  const getHousingSituationText = (situation: string | null) => {
    const situationMap: Record<string, string> = {
      'owned': 'Propietario',
      'rented': 'Inquilino',
      'borrowed': 'Prestada',
      'homeless': 'Sin vivienda',
      'other': 'Otra'
    };
    if (affiliate.housing_situation === undefined) {
      // Handle undefined case
    } else {
      // Pass it to the function since it's now string | null
    }
    return situation ? situationMap[situation] || situation : 'No especificada';
  };

  const generatePDF = async () => {
    if (!affiliate) {
      console.error('No se encontró información del afiliado.');
      return;
    }
  
    try {
      const doc = new jsPDF();
  
      // Logo de Asura
      const logoUrl = 'https://res.cloudinary.com/dhvrrxejo/image/upload/v1744998417/asura_logo_alfa_1_ct0uis.png'; // Cambia esta ruta al logo de Asura
      const profilePhotoUrl = affiliate.photo_url || '';
  
      // Cargar el logo y la foto de perfil
      const loadImages = async () => {
        try {
          const logoImage = await fetch(logoUrl).then((res) => res.blob());
          const profileImage = profilePhotoUrl
            ? await fetch(profilePhotoUrl).then((res) => res.blob())
            : null;
  
          const logoData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(logoImage);
          });
  
          const profileData = profileImage
            ? await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(profileImage);
              })
            : null;
  
          return { logoData, profileData };
        } catch (error) {
          console.error('Error al cargar imágenes:', error);
          return { logoData: null, profileData: null };
        }
      };
  
      const { logoData, profileData } = await loadImages();
  
      // Agregar el logo
      if (logoData) {
        if (typeof logoData === 'string' && logoData.startsWith('data:image/')) {
          doc.addImage(logoData, 'PNG', 10, 10, 40, 40);
        } else {
          console.error('Invalid logo data:', logoData);
        }
      }
  
      // Título del documento
      doc.setFontSize(18);
      doc.text('Resumen del Afiliado', 70, 20);
  
      // Fecha de impresión
      const printDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.setFontSize(10);
      doc.text(`Fecha de impresión: ${printDate}`, 90, 230);
  
      // Foto de perfil
      if (profileData) {
        if (typeof profileData === 'string' && profileData.startsWith('data:image/')) {
          doc.addImage(profileData, 'JPEG', 150, 40, 40, 40);
        } else {
          console.error('Invalid profile image data:', profileData);
        }
      }
  
      // Información personal
      doc.setFontSize(14);
      doc.text('Información Personal', 14, 60);
      doc.setFontSize(12);
      doc.text(`Nombre: ${affiliate.name}`, 14, 70);
      doc.text(`Documento de Identidad: ${affiliate.document_id || 'No especificado'}`, 14, 80);
      doc.text(`Estado Civil: ${getMaritalStatusText(affiliate.marital_status)}`, 14, 90);
      doc.text(`Cantidad de Hijos: ${affiliate.children_count || 'No especificado'}`, 14, 100);
      doc.text(`Fecha de Nacimiento: ${affiliate.birth_date ? formatDate(affiliate.birth_date) : 'No especificada'}`, 14, 110);
      doc.text(`Fecha de Afiliación: ${formatDate(affiliate.join_date)}`, 14, 120);
  
      // Información de contacto
      doc.setFontSize(14);
      doc.text('Información de Contacto', 14, 140);
      doc.setFontSize(12);
      doc.text(`Teléfono: ${affiliate.phone || 'No especificado'}`, 14, 150);
      doc.text(`Correo Electrónico: ${affiliate.email || 'No especificado'}`, 14, 160);
      doc.text(`Dirección: ${affiliate.address || 'No especificada'}`, 14, 170);
  
      // Guardar el documento
      doc.save(`Resumen_Afiliado_${affiliate.name}.pdf`);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PhotoModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        photoUrl={affiliate.photo_url || ''}
        name={affiliate.name}
        documentId={affiliate.document_id}
      />

      <PaymentUploadModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handlePaymentUpload}
        paymentMonth={selectedPayment ? formatDate(selectedPayment.due_date) : ''}
        amount={selectedPayment?.amount || 0}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ¿Está seguro que desea eliminar este afiliado?
            </h3>
            <p className="text-gray-500 mb-4">
              Esta acción no se puede deshacer. Se eliminarán todos los datos asociados al afiliado.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isLoading}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Detalles del Afiliado
        </h1>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
          <div className="flex items-center">
            {affiliate.photo_url ? (
              <button
                onClick={handlePhotoClick}
                className="focus:outline-none focus:ring-2 focus:ring-green-500 rounded-full"
              >
                <img
                  src={affiliate.photo_url}
                  alt={affiliate.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-105"
                />
              </button>
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center shadow-md">
                <span className="text-xl font-medium text-gray-500">
                  {affiliate.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {affiliate.name}
              </h2>
              <div className="flex items-center mt-1">
                <span
                  className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                    affiliate.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {affiliate.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center sm:order-last"
            >
              <Trash2 size={18} className="mr-2" />
              Eliminar
            </Button>

            
           

            <Button
              variant={affiliate.active ? 'outline' : 'primary'}
              onClick={handleToggleActive}
              className="flex items-center"
              disabled={isLoading}
            >
              {affiliate.active ? (
                <>
                  <UserMinus size={18} className="mr-2" />
                  Desactivar
                </>
              ) : (
                <>
                  <UserCheck size={18} className="mr-2" />
                  Activar
                </>
              )}
            </Button>

            <Link to={`/affiliates/${id}/edit`}>
              <Button variant="secondary" className="flex items-center">
                <Edit size={18} className="mr-1" />
                Editar Info
              </Button>
            </Link>

            <Button
              variant="primary"
              onClick={() => navigate(`/affiliates/${id}/credential`)}
              className="flex items-center"
            >
              <FileText size={18} className="mr-2" />
              Ver Credencial
            </Button>
          </div>
        </CardHeader>

        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Información Personal
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Documento de Identidad
                  </h4>
                  <p className="mt-1 text-gray-800">{affiliate.document_id}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Estado Civil
                  </h4>
                  <p className="mt-1 text-gray-800">
                    {getMaritalStatusText(affiliate.marital_status)}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Cantidad de Hijos
                  </h4>
                  <p className="mt-1 text-gray-800">
                    {affiliate.children_count || 'No especificado'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Fecha de Nacimiento
                  </h4>
                  <p className="mt-1 text-gray-800">
                    {affiliate.birth_date
                      ? formatDate(affiliate.birth_date)
                      : 'No especificada'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Fecha de Afiliación
                  </h4>
                  <p className="mt-1 text-gray-800">
                    {formatDate(affiliate.join_date)}
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-800 mt-8 mb-4 pb-2 border-b border-gray-200">
                Información de Contacto
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Teléfono
                  </h4>
                  <p className="mt-1 text-gray-800">{affiliate.phone}</p>
                  <p className="text-sm text-gray-500">
                    {affiliate.has_mobile_phone ? 'Posee teléfono celular' : 'No posee teléfono celular'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Correo Electrónico
                  </h4>
                  <p className="mt-1 text-gray-800">
                    {affiliate.email || 'No especificado'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Dirección
                  </h4>
                  <p className="mt-1 text-gray-800">{affiliate.address}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Información Laboral y Educativa
              </h3>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Situación Laboral
                  </h4>
                  <p className="mt-1 text-gray-800">
                    {getEmploymentTypeText(affiliate.employment_type || null)}
                    {affiliate.employment_type === 'other' && affiliate.employment_other_details && (
                      <span className="text-gray-600 ml-2">
                        ({affiliate.employment_other_details})
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Nivel Educativo
                  </h4>
                  <p className="mt-1 text-gray-800">
                    {getEducationLevelText(affiliate.education_level || null)}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Situación de Vivienda
                  </h4>
                  <p className="mt-1 text-gray-800">
                    {getHousingSituationText(affiliate.housing_situation ?? null)}
                    {affiliate.housing_situation === 'other' && affiliate.housing_other_details && (
                      <span className="text-gray-600 ml-2">
                        ({affiliate.housing_other_details})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-800 mt-8 mb-4 pb-2 border-b border-gray-200">
                Actividad de Recolección
              </h3>

              {affiliate.does_collection ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Materiales que Recolecta
                    </h4>
                    <p className="mt-1 text-gray-800">
                      {affiliate.collection_materials?.join(', ') || 'No especificados'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Lugar de Venta
                    </h4>
                    <p className="mt-1 text-gray-800">
                      {affiliate.collection_sale_location || 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Frecuencia de Recolección
                    </h4>
                    <p className="mt-1 text-gray-800">
                      {affiliate.collection_frequency || 'No especificada'}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500">
                      Ingreso Mensual Aproximado
                    </h4>
                    <p className="mt-1 text-gray-800">
                      {affiliate.collection_monthly_income
                        ? formatCurrency(affiliate.collection_monthly_income)
                        : 'No especificado'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No realiza actividades de recolección</p>
              )}

              <h3 className="text-lg font-medium text-gray-800 mt-8 mb-4 pb-2 border-b border-gray-200">
                Beneficios Sociales
              </h3>

              {affiliate.has_social_benefits ? (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Beneficios Recibidos
                  </h4>
                  <p className="mt-1 text-gray-800">
                    {affiliate.social_benefits_details?.join(', ') || 'No especificados'}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No recibe beneficios sociales</p>
              )}
            </div>
          </div>

          {affiliate.notes && (
            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Notas Adicionales
              </h3>
              <p className="text-gray-700 whitespace-pre-line">
                {affiliate.notes}
              </p>
            </div>
          )}

          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Estado de Cuotas
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={generatePDF}
                  className="flex items-center"
                >
                  <Download size={12} className="mr-2" />
                  Descargar Resumen
                </Button>
                <Link to="/payments">
                  <Button variant="outline" className="flex items-center">
                    <FileText size={18} className="mr-2" />
                    Ver Control de Cuotas
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mb-6">
              <PaymentCalendar
                payments={payments}
                joinDate={affiliate.join_date}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h4 className="font-medium text-yellow-800 mb-4">Opciones de Pago</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-800">Alias de Mercado Pago:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">asurasantiago.mp</span>
                    <a
                      href="https://www.mercadopago.com.ar/home"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="w-full sm:w-auto"
                  onClick={() => window.open('https://www.mercadopago.com.ar/home', '_blank')}
                >
                  Pagar con Mercado Pago
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha de Pago</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Transacción</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(payment.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${payment.amount.toLocaleString('es-AR')}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.payment_date ? formatDate(payment.payment_date) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.transaction_id || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex gap-2">
                          <PaymentTicket
                            payment={payment}
                            affiliateName={affiliate.name}
                          />
                          {payment.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowPaymentModal(true);
                              }}
                            >
                              Subir Comprobante
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            {qrCodeUrl && (
              <div className="text-center">
                <img
                  src={qrCodeUrl}
                  alt="QR Code"
                  className="w-32 h-32 mx-auto"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Escanea este código para realizar el pago
                </p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

// Ensure this file defines the expected props for AffiliatePrintCardComponent
export interface AffiliatePrintCardProps {
  affiliate: Affiliate; // Add the affiliate prop to the expected props
}

export default AffiliateDetailPage;

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvikszgcoclrzvseflhj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aWtzemdjb2Nscnp2c2VmbGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODM2NzIsImV4cCI6MjA1OTk1OTY3Mn0._OK4_ZJUGFUCFM3t-gRSUpYW7goNw_Ug7wWb5BkCrEw';
const supabase = createClient(supabaseUrl, supabaseKey);

deleteAffiliate: async (id: string) => {
  const { affiliates } = useAffiliateStore.getState(); // Ensure correct state management functions are retrieved
  try {
    // setIsLoading(true); // Removed as it is not defined in AffiliateState
    // Removed setError as it is not defined in AffiliateState

    // Elimina el registro del afiliado en Supabase
    const { error } = await supabase
      .from('affiliates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error al eliminar el afiliado en Supabase:', error);
      throw error;
    }

    // Actualiza el estado local eliminando el afiliado
    useAffiliateStore.setState({ affiliates });
    // setIsLoading(false); // Removed as it is not defined in AffiliateState
    useAffiliateStore.setState({ affiliates, isLoading: false });
    console.log('Afiliado eliminado con éxito:', id);
  } catch (error: any) {
    console.error('Error en deleteAffiliate:', error.message || error);
    useAffiliateStore.setState({ error: error.message, isLoading: false });
    throw error;
  }
};