import React, { useEffect, useState } from 'react';
import { supabase } from '../types/supabase';

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

  // Cargar datos desde la base de datos
  useEffect(() => {
    const fetchComision = async () => {
      const { data, error } = await supabase
        .from('comision_directiva')
        .select('*')
        .order('id', { ascending: true });
      if (!error && data) setComision(data);
    };
    fetchComision();
  }, []);

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
      // Al crear un nuevo integrante:
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
      .insert([{ nombre: nuevoNombre, cargo: nuevoCargo, foto_url, avatar_path }])
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
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4 text-center">Comisión Directiva</h1>
      <button
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded font-semibold"
        onClick={() => setAgregando(a => !a)}
      >
        {agregando ? 'Cancelar' : 'Crear nuevo'}
      </button>
      {agregando && (
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <div className="mb-2">
            <label className="block text-sm">Nombre:</label>
            <input
              type="text"
              value={nuevoNombre}
              onChange={e => setNuevoNombre(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm">Cargo:</label>
            <select
              value={nuevoCargo}
              onChange={e => setNuevoCargo(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            >
              <option value="">Seleccionar cargo</option>
              {cargos.map(cargo => (
                <option key={cargo} value={cargo}>{cargo}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm">Foto:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleNuevoFoto}
              className="block"
            />
          </div>
          <button
            onClick={handleCrearNuevo}
            className="bg-green-600 text-white px-4 py-2 rounded mt-2"
            disabled={guardandoNuevo}
          >
            {guardandoNuevo ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      )}
      <ul className="divide-y">
        {comision.map((miembro, idx) => (
          <li key={miembro.id} className="py-4 flex items-center gap-4">
            <img
              src={miembro.foto_url || '/default-avatar.png'}
              alt={miembro.nombre}
              className="w-16 h-16 rounded-full object-cover border border-gray-300"
              onError={e =>
                (e.currentTarget.src =
                  'https://ui-avatars.com/api/?name=' +
                  encodeURIComponent(miembro.nombre))
              }
            />
            <div className="flex-1">
              {editIdx === idx ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={editNombre}
                    onChange={handleNombreChange}
                    className="border rounded px-2 py-1 text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleNombreSave(idx)}
                      className="bg-green-600 text-white px-2 py-1 rounded text-xs"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleNombreCancel}
                      className="bg-gray-400 text-white px-2 py-1 rounded text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <span className="block font-medium">
                  {miembro.nombre}{' '}
                  <button
                    onClick={() => handleEditNombre(idx)}
                    className="ml-2 text-blue-600 text-xs underline"
                  >
                    Editar
                  </button>
                </span>
              )}
              <span className="block text-gray-600 text-sm">{miembro.cargo}</span>
              <label className="block mt-2 text-xs text-gray-500">
                Cambiar foto:
                <input
                  type="file"
                  accept="image/*"
                  className="block mt-1"
                  disabled={loadingIdx === idx}
                  onChange={e => handleFotoChange(e, idx)}
                />
                {loadingIdx === idx && (
                  <span className="text-blue-600 ml-2">Subiendo...</span>
                )}
              </label>
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-gray-400 mt-4">
        * Los cambios se guardan en la base de datos.
      </p>
    </div>
  );
};

export default ComisionDirectivaPage;