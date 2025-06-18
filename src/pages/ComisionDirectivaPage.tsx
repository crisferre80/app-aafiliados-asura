import React, { useEffect, useState, useContext } from 'react';
import { supabase } from '../types/supabase';
import { ProvinceContext } from '../components/Layout';

const BUCKET = 'comision-fotos';

interface Miembro {
  id: number;
  nombre: string;
  cargo: string;
  foto_url: string | null;
  avatar_path: string | null;
}

const cargos = [
  'Secretario General',
  'Secretario Adjunto',
  'Tesorero',
  'Protesorero',
  'Secretario de Prensa y Difusión',
  'Secretario de Trabajo',
  'Secretario Gremial',
  'Secretaria de Actas',
  'Prosecretaria de Actas',
  'Secretaria de Acción Social',
  'Secretaria de Turismo',
  'Secretario de Deportes',
  'Secretario de Organización',
  'Secretaria de Educación',
];

const ComisionDirectivaPage: React.FC = () => {
  const { selectedProvince } = useContext(ProvinceContext);
  const [comision, setComision] = useState<Miembro[]>([]);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState<string>('');
  // Nuevo integrante
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoCargo, setNuevoCargo] = useState('');
  const [nuevaFoto, setNuevaFoto] = useState<File | null>(null);
  const [agregando, setAgregando] = useState(false);
  const [guardandoNuevo, setGuardandoNuevo] = useState(false);

  // Cargar datos desde la base de datos filtrando por provincia
  useEffect(() => {
    if (!selectedProvince) {
      setComision([]);
      return;
    }
    const fetchComision = async () => {
      const { data, error } = await supabase
        .from('comision_directiva')
        .select('*')
        .eq('province', selectedProvince)
        .order('id', { ascending: true });
      if (!error && data) setComision(data);
      else setComision([]);
    };
    fetchComision();
  }, [selectedProvince]);

  // Subir foto y actualizar en la base de datos
  const handleFotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingIdx(idx);

    const miembro = comision[idx];
    const fileExt = file.name.split('.').pop();
    // Al subir foto de un miembro existente:
    const fileName = `${miembro.nombre.replace(/\s/g, '_').toLowerCase()}_${Date.now()}.${fileExt}`;
    const filePath = `comision-fotos/${fileName}`;

    // Sube la imagen al bucket
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (uploadError) {
      alert('Error al subir la imagen');
      setLoadingIdx(null);
      return;
    }

    // Obtiene la URL pública
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

    // Actualiza en la base de datos
    const { error: updateError } = await supabase
      .from('comision_directiva')
      .update({ foto_url: urlData.publicUrl, avatar_path: filePath })
      .eq('id', miembro.id);

    if (updateError) {
      alert('Error al actualizar la base de datos');
      setLoadingIdx(null);
      return;
    }

    setComision(prev =>
      prev.map((m, i) =>
        i === idx ? { ...m, foto_url: urlData.publicUrl, avatar_path: filePath } : m
      )
    );
    setLoadingIdx(null);
  };

  // Editar nombre
  const handleEditNombre = (idx: number) => {
    setEditIdx(idx);
    setEditNombre(comision[idx].nombre);
  };

  const handleNombreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditNombre(e.target.value);
  };

  const handleNombreSave = async (idx: number) => {
    const miembro = comision[idx];
    const { error } = await supabase
      .from('comision_directiva')
      .update({ nombre: editNombre })
      .eq('id', miembro.id);

    if (error) {
      alert('Error al actualizar el nombre');
      return;
    }

    setComision(prev =>
      prev.map((m, i) =>
        i === idx ? { ...m, nombre: editNombre } : m
      )
    );
    setEditIdx(null);
    setEditNombre('');
  };

  const handleNombreCancel = () => {
    setEditIdx(null);
    setEditNombre('');
  };

  // Crear nuevo integrante
  const handleNuevoFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setNuevaFoto(file);
  };

  const handleCrearNuevo = async () => {
    if (!nuevoNombre || !nuevoCargo) {
      alert('Completa nombre y cargo');
      return;
    }
    setGuardandoNuevo(true);

    let foto_url: string | null = null;
    let avatar_path: string | null = null;

    if (nuevaFoto) {
      const fileExt = nuevaFoto.name.split('.').pop();
      const fileName = `${nuevoNombre.replace(/\s/g, '_').toLowerCase()}_${Date.now()}.${fileExt}`;
      const filePath = `comision-fotos/${fileName}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, nuevaFoto, {
        cacheControl: '3600',
        upsert: true,
      });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
        foto_url = urlData.publicUrl;
        avatar_path = filePath;
      }
    }

    const { data, error } = await supabase
      .from('comision_directiva')
      .insert([{ nombre: nuevoNombre, cargo: nuevoCargo, foto_url, avatar_path, province: selectedProvince }])
      .select();

    if (error) {
      alert('Error al crear integrante');
      setGuardandoNuevo(false);
      return;
    }

    if (data && data.length > 0) {
      setComision(prev => [
        ...prev,
        {
          ...data[0],
          foto_url: foto_url,
          avatar_path: avatar_path,
        }
      ]);
    }

    setNuevoNombre('');
    setNuevoCargo('');
    setNuevaFoto(null);
    setAgregando(false);
    setGuardandoNuevo(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-8 bg-white rounded-2xl shadow-lg">
      <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-800 tracking-tight drop-shadow">
        Comisión Directiva
      </h1>
      <div className="flex justify-center mb-8">
        <button
          className={`transition-all duration-200 mb-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow ${agregando ? 'scale-95' : 'scale-100'}`}
          onClick={() => setAgregando(a => !a)}
        >
          {agregando ? 'Cancelar' : 'Crear nuevo'}
        </button>
      </div>
      {agregando && (
        <div className="mb-8 p-6 border rounded-xl bg-blue-50 shadow-inner max-w-md mx-auto animate-fade-in">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-blue-900">Nombre:</label>
            <input
              type="text"
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-blue-900">Cargo:</label>
            <select
              value={nuevoCargo}
              onChange={e => setNuevoCargo(e.target.value)}
              className="border rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-300"
            >
              <option value="">Seleccionar cargo</option>
              {cargos.map(cargo => (
                <option key={cargo} value={cargo}>{cargo}</option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-blue-900">Foto:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleNuevoFoto}
              className="block"
            />
          </div>
          <button
            onClick={handleCrearNuevo}
            className="bg-green-600 hover:bg-green-700 transition text-white px-6 py-2 rounded-lg mt-2 font-semibold shadow"
            disabled={guardandoNuevo}
          >
            {guardandoNuevo ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {comision.map((miembro, idx) => (
          <li
            key={miembro.id}
            className={`group bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-6 flex flex-col items-center transition-all duration-200 hover:scale-105 hover:shadow-2xl border border-transparent hover:border-blue-300`}
          >
            <div className="relative">
              <img
                src={miembro.foto_url || '/default-avatar.png'}
                alt={miembro.nombre}
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-md transition-all duration-200 group-hover:border-blue-500 group-hover:shadow-xl"
                onError={e =>
                  (e.currentTarget.src =
                    'https://ui-avatars.com/api/?name=' +
                    encodeURIComponent(miembro.nombre))
                }
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer shadow-lg opacity-80 hover:opacity-100 transition-opacity text-xs flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={loadingIdx === idx}
                  onChange={e => handleFotoChange(e, idx)}
                />
                {/* Icono de cámara SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553.378A2 2 0 0122 12.368V17a2 2 0 01-2 2H4a2 2 0 01-2-2v-4.632a2 2 0 012.447-1.99L9 10m6 0V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v3m6 0H9" />
                  <circle cx="12" cy="14" r="3" />
                </svg>
                {loadingIdx === idx && (
                  <span className="ml-1 animate-pulse">Subiendo...</span>
                )}
              </label>
            </div>
            <div className="mt-5 w-full text-center">
              {editIdx === idx ? (
                <div className="flex flex-col gap-2 items-center">
                  <input
                    type="text"
                    value={editNombre}
                    onChange={handleNombreChange}
                    className="border rounded px-2 py-1 text-sm w-4/5 focus:ring-2 focus:ring-blue-300"
                  />
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => handleNombreSave(idx)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleNombreCancel}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-xs font-semibold transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="block font-bold text-lg text-blue-900 group-hover:text-blue-700 transition">
                    {miembro.nombre}
                    <button
                      onClick={() => handleEditNombre(idx)}
                      className="ml-2 text-blue-500 hover:text-blue-700 text-xs underline transition"
                    >
                      Editar
                    </button>
                  </span>
                </div>
              )}
              <span className="block text-blue-700 text-sm font-medium mt-1">{miembro.cargo}</span>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-400 mt-8 text-center">
        * Los cambios se guardan en la base de datos.
      </p>
    </div>
  );
};

export default ComisionDirectivaPage;