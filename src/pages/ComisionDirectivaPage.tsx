import React from 'react';

const comision = [
  { nombre: 'Juan Pérez', cargo: 'Secretario General' },
  { nombre: 'Ana Gómez', cargo: 'Secretaria Adjunta' },
  { nombre: 'Carlos Ruiz', cargo: 'Tesorero' },
  { nombre: 'María López', cargo: 'Protesorera' },
  // Agrega más miembros según corresponda
];

const ComisionDirectivaPage: React.FC = () => (
  <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded shadow">
    <h1 className="text-2xl font-bold mb-4 text-center">Comisión Directiva</h1>
    <ul className="divide-y">
      {comision.map((miembro, idx) => (
        <li key={idx} className="py-3 flex justify-between">
          <span className="font-medium">{miembro.nombre}</span>
          <span className="text-gray-600">{miembro.cargo}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default ComisionDirectivaPage;