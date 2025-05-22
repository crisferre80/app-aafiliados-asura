import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAffiliateStore } from '../store/affiliateStore';
import Card, { CardHeader, CardBody, CardFooter } from '../components/Card';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import PhotoUpload from '../components/PhotoUpload';
import { ArrowLeft, Save } from 'lucide-react';

const AffiliateFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const { affiliates, addAffiliate, updateAffiliate, uploadPhoto, isLoading, fetchAffiliates } = useAffiliateStore();
  
  // Basic Information
  const [name, setName] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split('T')[0]);
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoChanged, setPhotoChanged] = useState(false);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);

  // Marital Status and Children
  const [maritalStatus, setMaritalStatus] = useState<string>('');
  const [childrenCount, setChildrenCount] = useState<string>('');
  
  // Mobile Device
  const [hasMobilePhone, setHasMobilePhone] = useState(false);
  
  // Employment
  const [employmentType, setEmploymentType] = useState<string>('');
  const [employmentOtherDetails, setEmploymentOtherDetails] = useState('');
  
  // Education
  const [educationLevel, setEducationLevel] = useState<string>('');
  
  // Housing
  const [housingSituation, setHousingSituation] = useState<string>('');
  const [housingOtherDetails, setHousingOtherDetails] = useState('');
  
  // Collection Activity
  const [doesCollection, setDoesCollection] = useState(false);
  const [collectionMaterials, setCollectionMaterials] = useState('');
  const [collectionSaleLocation, setCollectionSaleLocation] = useState('');
  const [collectionFrequency, setCollectionFrequency] = useState('');
  const [collectionMonthlyIncome, setCollectionMonthlyIncome] = useState('');
  
  // Social Benefits
  const [hasSocialBenefits, setHasSocialBenefits] = useState(false);
  const [socialBenefitsDetails, setSocialBenefitsDetails] = useState('');
  
  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (isEditMode && id) {
      const affiliate = affiliates.find(a => a.id === id);
      
      if (!affiliate && affiliates.length === 0) {
        fetchAffiliates();
        return;
      }
      
      if (affiliate) {
        // Basic Information
        setName(affiliate.name);
        setDocumentId(affiliate.document_id);
        setPhone(affiliate.phone);
        setAddress(affiliate.address);
        setEmail(affiliate.email || '');
        setBirthDate(affiliate.birth_date ? new Date(affiliate.birth_date).toISOString().split('T')[0] : '');
        setJoinDate(new Date(affiliate.join_date).toISOString().split('T')[0]);
        setActive(affiliate.active);
        setNotes(affiliate.notes || '');
        setPhotoUrl(affiliate.photo_url ?? null);
        
        // Additional Information
        setMaritalStatus(affiliate.marital_status || '');
        setChildrenCount(affiliate.children_count?.toString() || '');
        setHasMobilePhone(affiliate.has_mobile_phone || false);
        setEmploymentType(affiliate.employment_type || '');
        setEmploymentOtherDetails(affiliate.employment_other_details || '');
        setEducationLevel(affiliate.education_level || '');
        setHousingSituation(affiliate.housing_situation || '');
        setHousingOtherDetails(affiliate.housing_other_details || '');
        setDoesCollection(affiliate.does_collection || false);
        setCollectionMaterials(affiliate.collection_materials?.join(', ') || '');
        setCollectionSaleLocation(affiliate.collection_sale_location || '');
        setCollectionFrequency(affiliate.collection_frequency || '');
        setCollectionMonthlyIncome(affiliate.collection_monthly_income?.toString() || '');
        setHasSocialBenefits(affiliate.has_social_benefits || false);
        setSocialBenefitsDetails(affiliate.social_benefits_details?.join(', ') || '');
      } else {
        navigate('/affiliates');
      }
    }
  }, [id, affiliates, isEditMode, navigate, fetchAffiliates]);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'El nombre es requerido';
    if (!documentId.trim()) newErrors.documentId = 'El documento es requerido';
    if (!phone.trim()) newErrors.phone = 'El teléfono es requerido';
    if (!address.trim()) newErrors.address = 'La dirección es requerida';
    if (!joinDate) newErrors.joinDate = 'La fecha de afiliación es requerida';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }
    
    // Validate collection monthly income if collection is enabled
    if (doesCollection && collectionMonthlyIncome) {
      const income = parseFloat(collectionMonthlyIncome);
      if (isNaN(income) || income < 0) {
        newErrors.collectionMonthlyIncome = 'El ingreso mensual debe ser un número positivo';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handlePhotoCapture = (file: File) => {
    setNewPhotoFile(file);
    setPhotoChanged(true);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    let finalPhotoUrl = photoUrl;
    
    if (photoChanged && newPhotoFile) {
      finalPhotoUrl = await uploadPhoto(newPhotoFile);
    }
    
    const affiliateData = {
      // Basic Information
      name,
      document_id: documentId,
      phone,
      address,
      email: email || null,
      birth_date: birthDate || null,
      join_date: joinDate,
      active,
      notes: notes || null,
      photo_url: finalPhotoUrl,
      
      // Additional Information
      marital_status: (["single", "married", "divorced", "widowed", "domestic_partnership"].includes(maritalStatus)
        ? maritalStatus as "single" | "married" | "divorced" | "widowed" | "domestic_partnership"
        : null),
      children_count: childrenCount ? parseInt(childrenCount) : null,
      has_mobile_phone: hasMobilePhone,
      employment_type: (
        ["formal", "informal", "unemployed", "retired", "temporary", "other"].includes(employmentType)
          ? employmentType as "formal" | "informal" | "unemployed" | "retired" | "temporary" | "other"
          : null
      ),
      employment_other_details: employmentOtherDetails || null,
      education_level: (
        [
          "none",
          "primary_incomplete",
          "primary_complete",
          "secondary_incomplete",
          "secondary_complete",
          "tertiary_incomplete",
          "tertiary_complete"
        ].includes(educationLevel)
          ? educationLevel as
              | "none"
              | "primary_incomplete"
              | "primary_complete"
              | "secondary_incomplete"
              | "secondary_complete"
              | "tertiary_incomplete"
              | "tertiary_complete"
          : null
      ),
      housing_situation: (
        ["owned", "rented", "borrowed", "homeless", "other"].includes(housingSituation)
          ? housingSituation as "owned" | "rented" | "borrowed" | "homeless" | "other"
          : null
      ),
      housing_other_details: housingOtherDetails || null,
      does_collection: doesCollection,
      collection_materials: collectionMaterials ? collectionMaterials.split(',').map(s => s.trim()) : [],
      collection_sale_location: collectionSaleLocation || null,
      collection_frequency: collectionFrequency || null,
      collection_monthly_income: doesCollection && collectionMonthlyIncome ? parseFloat(collectionMonthlyIncome) : null,
      has_social_benefits: hasSocialBenefits,
      social_benefits_details: socialBenefitsDetails ? socialBenefitsDetails.split(',').map(s => s.trim()) : []
    };
    
    if (isEditMode && id) {
      await updateAffiliate(id, affiliateData);
      navigate(`/affiliates/${id}`);
    } else {
      const newId = await addAffiliate(affiliateData);
      if (newId) {
        navigate(`/affiliates/${newId}`);
      }
    }
  };
  
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEditMode ? 'Editar Afiliado' : 'Nuevo Afiliado'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Información Básica</h2>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                id="name"
                label="Nombre Completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
                required
              />
              
              <Input
                id="documentId"
                label="Número de Documento"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                error={errors.documentId}
                required
              />
              
              <Input
                id="phone"
                label="Teléfono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                required
              />
              
              <Input
                id="email"
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              
              <Input
                id="address"
                label="Dirección"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                error={errors.address}
                required
              />
              
              <Input
                id="birthDate"
                label="Fecha de Nacimiento"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
              
              <Input
                id="joinDate"
                label="Fecha de Afiliación"
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                error={errors.joinDate}
                required
              />
              
              <PhotoUpload 
                onPhotoCapture={handlePhotoCapture}
                currentPhotoUrl={photoUrl}
              />
              
              <div className="flex items-center">
                <input
                  id="active"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                />
                <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
                  Afiliado Activo
                </label>
              </div>
            </CardBody>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Información Personal</h2>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Civil
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="single">Soltero/a</option>
                  <option value="married">Casado/a</option>
                  <option value="divorced">Divorciado/a</option>
                  <option value="widowed">Viudo/a</option>
                  <option value="domestic_partnership">Unión de hecho</option>
                </select>
              </div>

              <Input
                id="childrenCount"
                label="Cantidad de Hijos"
                type="number"
                value={childrenCount}
                onChange={(e) => setChildrenCount(e.target.value)}
              />

              <div className="flex items-center">
                <input
                  id="hasMobilePhone"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  checked={hasMobilePhone}
                  onChange={(e) => setHasMobilePhone(e.target.checked)}
                />
                <label htmlFor="hasMobilePhone" className="ml-2 block text-sm text-gray-900">
                  Posee teléfono celular
                </label>
              </div>
            </CardBody>
          </Card>

          {/* Employment and Education */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Empleo y Educación</h2>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Situación Laboral
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="formal">Empleado formal</option>
                  <option value="informal">Empleado informal</option>
                  <option value="unemployed">Desempleado</option>
                  <option value="retired">Jubilado</option>
                  <option value="temporary">Trabajo temporal</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              {employmentType === 'other' && (
                <Input
                  id="employmentOtherDetails"
                  label="Especifique situación laboral"
                  value={employmentOtherDetails}
                  onChange={(e) => setEmploymentOtherDetails(e.target.value)}
                />
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel Educativo
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="none">Sin estudios</option>
                  <option value="primary_incomplete">Primario incompleto</option>
                  <option value="primary_complete">Primario completo</option>
                  <option value="secondary_incomplete">Secundario incompleto</option>
                  <option value="secondary_complete">Secundario completo</option>
                  <option value="tertiary_incomplete">Terciario/Universitario incompleto</option>
                  <option value="tertiary_complete">Terciario/Universitario completo</option>
                </select>
              </div>
            </CardBody>
          </Card>

          {/* Housing */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Vivienda</h2>
            </CardHeader>
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Situación de Vivienda
                </label>
                <select
                  value={housingSituation}
                  onChange={(e) => setHousingSituation(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="owned">Propia</option>
                  <option value="rented">Alquilada</option>
                  <option value="borrowed">Prestada</option>
                  <option value="homeless">En situación de calle</option>
                  <option value="other">Otra</option>
                </select>
              </div>

              {housingSituation === 'other' && (
                <Input
                  id="housingOtherDetails"
                  label="Especifique situación de vivienda"
                  value={housingOtherDetails}
                  onChange={(e) => setHousingOtherDetails(e.target.value)}
                />
              )}
            </CardBody>
          </Card>

          {/* Collection Activity */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Actividad de Recolección</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="flex items-center">
                <input
                  id="doesCollection"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  checked={doesCollection}
                  onChange={(e) => setDoesCollection(e.target.checked)}
                />
                <label htmlFor="doesCollection" className="ml-2 block text-sm text-gray-900">
                  Realiza actividades de recolección
                </label>
              </div>

              {doesCollection && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    id="collectionMaterials"
                    label="Materiales que recolecta"
                    value={collectionMaterials}
                    onChange={(e) => setCollectionMaterials(e.target.value)}
                    placeholder="Separar con comas"
                  />

                  <Input
                    id="collectionSaleLocation"
                    label="¿Dónde los vende?"
                    value={collectionSaleLocation}
                    onChange={(e) => setCollectionSaleLocation(e.target.value)}
                  />

                  <Input
                    id="collectionFrequency"
                    label="Frecuencia de recolección"
                    value={collectionFrequency}
                    onChange={(e) => setCollectionFrequency(e.target.value)}
                  />

                  <Input
                    id="collectionMonthlyIncome"
                    label="Ingreso aproximado mensual"
                    type="number"
                    value={collectionMonthlyIncome}
                    onChange={(e) => setCollectionMonthlyIncome(e.target.value)}
                    error={errors.collectionMonthlyIncome}
                  />
                </div>
              )}
            </CardBody>
          </Card>

          {/* Social Benefits */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Beneficios Sociales</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="flex items-center">
                <input
                  id="hasSocialBenefits"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  checked={hasSocialBenefits}
                  onChange={(e) => setHasSocialBenefits(e.target.checked)}
                />
                <label htmlFor="hasSocialBenefits" className="ml-2 block text-sm text-gray-900">
                  Es beneficiario de algún plan social o pensión
                </label>
              </div>

              {hasSocialBenefits && (
                <Input
                  id="socialBenefitsDetails"
                  label="Especifique cuál/es"
                  value={socialBenefitsDetails}
                  onChange={(e) => setSocialBenefitsDetails(e.target.value)}
                  placeholder="Separar con comas"
                />
              )}
            </CardBody>
          </Card>

          {/* Notes */}
          <Card>
            <CardBody>
              <TextArea
                id="notes"
                label="Notas Adicionales"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardBody>
          </Card>

          {/* Form Actions */}
          <Card>
            <CardFooter className="flex justify-between">
              <Link to="/affiliates">
                <Button variant="outline">
                  Cancelar
                </Button>
              </Link>
              
              <Button 
                type="submit" 
                variant="primary"
                isLoading={isLoading}
                className="flex items-center"
              >
                <Save size={18} className="mr-2" />
                {isEditMode ? 'Actualizar' : 'Guardar'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default AffiliateFormPage;