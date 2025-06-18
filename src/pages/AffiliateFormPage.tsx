import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAffiliateStore } from '../store/affiliateStore';
import Card, { CardHeader, CardBody, CardFooter } from '../components/Card';
import Input from '../components/Input';
import TextArea from '../components/TextArea';
import Button from '../components/Button';
import PhotoUpload from '../components/PhotoUpload';
import { ArrowLeft, Save } from 'lucide-react'; // Importa el icono de intercambio
import toast from 'react-hot-toast';
import { ProvinceContext } from '../components/Layout';

const allowedMaritalStatuses = ["single", "married", "divorced", "widowed", "domestic_partnership"] as const;
type MaritalStatus = typeof allowedMaritalStatuses[number];

const allowedEmploymentTypes = ["formal", "informal", "unemployed", "retired", "temporary", "other"] as const;
type EmploymentType = typeof allowedEmploymentTypes[number];

type EducationLevel =
  | "none"
  | "primary_incomplete"
  | "primary_complete"
  | "secondary_incomplete"
  | "secondary_complete"
  | "tertiary_incomplete"
  | "tertiary_complete";

const allowedHousingSituations = ["owned", "rented", "borrowed", "homeless", "other"] as const;
type HousingSituation = typeof allowedHousingSituations[number];

const AffiliateFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const { affiliates, addAffiliate, updateAffiliate, uploadPhoto, isLoading, fetchAffiliates } = useAffiliateStore();
  const { selectedProvince, setSelectedProvince } = useContext(ProvinceContext);

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
  const [educationLevel, setEducationLevel] = useState<EducationLevel | ''>('');

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

  // Nuevo estado para el departamento
  const [department, setDepartment] = useState('');

  // Nuevos estados para la empresa y cargo
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');

  // Estado para la provincia
  const [province, setProvince] = useState(selectedProvince || 'Santiago del Estero');

  // Opciones de departamentos/partidos por provincia
  const departmentOptions: Record<string, string[]> = {
    'Santiago del Estero': [
      'Capital', 'Banda', 'Aguirre', 'Alberdi', 'Atamisqui', 'Avellaneda', 'Belgrano', 'Copo', 'Choya', 'Figueroa',
      'General Taboada', 'Guasayán', 'Jiménez', 'Juan Felipe Ibarra', 'Loreto', 'Mitre', 'Moreno', 'Ojo de Agua',
      'Pellegrini', 'Quebrachos', 'Río Hondo', 'Rivadavia', 'Robles', 'Salavina', 'San Martín', 'Sarmiento', 'Silípica', 'Otro'
    ],
    'Buenos Aires': [
      'La Plata', 'Avellaneda', 'Quilmes', 'Lomas de Zamora', 'Morón', 'San Isidro', 'San Martín', 'Tres de Febrero', 'Vicente López', 'Lanús', 'General San Martín', 'Florencio Varela', 'Berazategui', 'Almirante Brown', 'Otro'
    ],
    'Córdoba': [
      'Capital', 'Colón', 'Río Cuarto', 'San Justo', 'Punilla', 'General San Martín', 'Unión', 'Tercero Arriba', 'Otro'
    ],
    'Santa Fe': [
      'Rosario', 'La Capital', 'General López', 'San Lorenzo', 'Castellanos', 'San Jerónimo', 'San Martín', 'Otro'
    ],
    'Capital Federal': [
      'Agronomía', 'Almagro', 'Balvanera', 'Barracas', 'Belgrano', 'Boedo', 'Caballito', 'Chacarita', 'Coghlan',
      'Colegiales', 'Constitución', 'Flores', 'Floresta', 'La Boca', 'La Paternal', 'Liniers', 'Mataderos',
      'Monserrat', 'Monte Castro', 'Nueva Pompeya', 'Núñez', 'Palermo', 'Parque Avellaneda', 'Parque Chacabuco',
      'Parque Chas', 'Parque Patricios', 'Puerto Madero', 'Recoleta', 'Retiro', 'Saavedra', 'San Cristóbal',
      'San Nicolás', 'San Telmo', 'Vélez Sarsfield', 'Versalles', 'Villa Crespo', 'Villa del Parque',
      'Villa Devoto', 'Villa General Mitre', 'Villa Lugano', 'Villa Luro', 'Villa Ortúzar', 'Villa Pueyrredón',
      'Villa Real', 'Villa Riachuelo', 'Villa Santa Rita', 'Villa Soldati', 'Villa Urquiza', 'Otro'
    ],
    // ...agrega más provincias y sus departamentos/partidos principales...
    'Otro': ['Otro']
  };

  // Provincias ordenadas alfabéticamente (incluyendo Capital Federal)
  const provinceOptions = [
    'Buenos Aires', 'Córdoba', 'Santa Fe', 'Mendoza', 'Tucumán', 'Entre Ríos', 'Salta', 'Chaco', 'Misiones', 'Corrientes',
    'San Juan', 'Jujuy', 'Río Negro', 'Formosa', 'Neuquén', 'San Luis', 'La Rioja', 'Catamarca', 'La Pampa', 'Santa Cruz',
    'Chubut', 'Tierra del Fuego', 'Santiago del Estero', 'Capital Federal'
  ].sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    if (isEditMode && id) {
      const affiliate = affiliates.find(a => a.id === id);

      if (!affiliate && affiliates.length === 0) {
        fetchAffiliates();
        return;
      }

      if (affiliate) {
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

        setMaritalStatus(affiliate.marital_status || '');
        setChildrenCount(affiliate.children_count !== null && affiliate.children_count !== undefined ? affiliate.children_count.toString() : '');
        setHasMobilePhone(affiliate.has_mobile_phone || false);
        setEmploymentType(affiliate.employment_type || '');
        setEmploymentOtherDetails(affiliate.employment_other_details || '');
        setEducationLevel(affiliate.education_level || '');
        setHousingSituation(affiliate.housing_situation || '');
        setHousingOtherDetails(affiliate.housing_other_details || '');
        setDoesCollection(affiliate.does_collection || false);
        setCollectionMaterials(Array.isArray(affiliate.collection_materials) ? affiliate.collection_materials.join(', ') : '');
        setCollectionSaleLocation(affiliate.collection_sale_location || '');
        setCollectionFrequency(affiliate.collection_frequency || '');
        setCollectionMonthlyIncome(affiliate.collection_monthly_income !== null && affiliate.collection_monthly_income !== undefined ? affiliate.collection_monthly_income.toString() : '');
        setHasSocialBenefits(affiliate.has_social_benefits || false);
        setSocialBenefitsDetails(Array.isArray(affiliate.social_benefits_details) ? affiliate.social_benefits_details.join(', ') : '');
        setDepartment(affiliate.department || ''); // Nuevo campo
        setCompany(affiliate.company || ''); // Nuevo campo
        setPosition(affiliate.position || ''); // Nuevo campo
        setProvince(affiliate.province || selectedProvince || 'Santiago del Estero'); // Nuevo campo
      } else {
        navigate('/affiliates');
      }
    }
  }, [id, affiliates, isEditMode, navigate, fetchAffiliates, selectedProvince]);

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

    if (doesCollection && collectionMonthlyIncome) {
      const income = parseFloat(collectionMonthlyIncome);
      if (isNaN(income) || income < 0) {
        newErrors.collectionMonthlyIncome = 'El ingreso mensual debe ser un número positivo';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cambia la firma para aceptar el tipo de cámara
  const handlePhotoCapture = (file: File) => {
    setNewPhotoFile(file);
    setPhotoChanged(true);
    // Puedes guardar el tipo de cámara si lo necesitas en el estado
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
      education_level: educationLevel === '' ? null : educationLevel,

      // Additional Information
      marital_status: allowedMaritalStatuses.includes(maritalStatus as MaritalStatus) ? (maritalStatus as MaritalStatus) : null,
      children_count: childrenCount !== '' && !isNaN(Number(childrenCount)) ? parseInt(childrenCount) : null,
      has_mobile_phone: hasMobilePhone,
      employment_type: allowedEmploymentTypes.includes(employmentType as EmploymentType) ? (employmentType as EmploymentType) : null,
      employment_other_details: employmentOtherDetails || null,
      housing_situation: allowedHousingSituations.includes(housingSituation as HousingSituation) ? (housingSituation as HousingSituation) : null,
      housing_other_details: housingOtherDetails || null,
      does_collection: doesCollection,
      collection_materials: collectionMaterials
        ? collectionMaterials.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      collection_sale_location: collectionSaleLocation || null,
      collection_frequency: collectionFrequency || null,
      collection_monthly_income: doesCollection && collectionMonthlyIncome && !isNaN(Number(collectionMonthlyIncome))
        ? parseFloat(collectionMonthlyIncome)
        : null,
      has_social_benefits: hasSocialBenefits,
      social_benefits_details: socialBenefitsDetails
        ? socialBenefitsDetails.split(',').map(s => s.trim()).filter(Boolean)
        : [],
      department,
      company,
      position,
      province,
    };

    if (isEditMode && id) {
      await updateAffiliate(id, affiliateData);
      toast.success('Afiliado de ASURA actualizado correctamente');
      navigate(`/affiliates/${id}`);
    } else {
      const newId = await addAffiliate(affiliateData);
      if (newId) {
        toast.success('Afiliado de ASURA guardado correctamente');
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

              {/* Campo de Provincia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                <select
                  value={province}
                  onChange={e => {
                    setProvince(e.target.value);
                    setSelectedProvince(e.target.value);
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {provinceOptions.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>

              {/* Nuevo campo: Departamento de Santiago del Estero */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento o Partido
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {(departmentOptions[province] || departmentOptions['Otro']).map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>

              {/* Nuevo campo: Empresa donde trabaja */}
              <Input
                id="company"
                label="Empresa donde trabaja"
                value={company}
                onChange={e => setCompany(e.target.value)}
              />

              {/* Nuevo campo: Cargo que ocupa */}
              <Input
                id="position"
                label="Cargo que ocupa"
                value={position}
                onChange={e => setPosition(e.target.value)}
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
              
              <div>
                {/* Botón de alternancia de cámara eliminado */}
                <PhotoUpload 
                  onPhotoCapture={handlePhotoCapture}
                  currentPhotoUrl={photoUrl}
                />
              </div>
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
                  onChange={(e) => setEducationLevel(e.target.value as EducationLevel | '')}
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