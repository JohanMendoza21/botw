// src/components/Card.jsx
import React from 'react';

function Card({ card, onEdit, onDelete }) {
  const { image, name, gender, price, message, send } = card;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden flex flex-col border border-gray-200">
      <img
        src={image}
        alt={name || 'Zapatilla'}
        className="w-full h-36 object-cover"
      />

      <div className="p-3 flex flex-col gap-1 flex-1">
        {name && (
          <h3 className="text-sm font-semibold text-gray-800">{name}</h3>
        )}

        <p className="text-xs text-gray-500 capitalize">
          Género: <span className="font-medium">{gender}</span>
        </p>

        <p className="text-sm text-green-700 font-bold">
          ${price}
        </p>

        {message && (
          <p className="text-xs text-gray-600 mt-1 italic">
            {message}
          </p>
        )}

        <div className="mt-auto flex justify-between items-center pt-2">
          {/* ✅ Etiqueta de estado mejorada */}
          <span className={`text-xs font-medium px-3 py-1 rounded-md border ${
            send
              ? 'bg-green-50 text-green-700 border-green-300'
              : 'bg-red-50 text-red-600 border-red-300'
          }`}>
            {send ? 'Listo para enviar' : 'No enviar'}
          </span>

          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="text-blue-600 text-xs hover:underline"
            >
              Editar
            </button>
            <button
              onClick={onDelete}
              className="text-red-500 text-xs hover:underline"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
