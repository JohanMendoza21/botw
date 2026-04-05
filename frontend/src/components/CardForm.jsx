// src/components/CardForm.jsx
import React, { useState, useEffect } from 'react';

function CardForm({ onSave, onCancel, initialValues, isEditing = false }) {
  const [formData, setFormData] = useState({
    name: '',
    gender: 'ambas',
    price: '',
    image: '',
    message: '',
    send: false,
  });

  // Cuando hay initialValues (modo edición), los cargamos al estado
  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        gender: initialValues.gender || 'ambas',
        price: initialValues.price || '',
        image: initialValues.image || '',
        message: initialValues.message || '',
        send: initialValues.send || false,
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full h-full bg-white border border-gray-300 rounded-lg shadow flex flex-col p-2 text-xs gap-1"
    >
      {/* Imagen */}
      <div className="w-full h-20 bg-gray-100 flex items-center justify-center text-gray-400 text-[10px] rounded mb-1">
        {formData.image ? (
          <img
            src={formData.image}
            alt="preview"
            className="h-full object-contain rounded"
          />
        ) : (
          'Sin imagen'
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="text-[10px] mb-1"
      />

      {/* Nombre */}
      <input
        type="text"
        name="name"
        placeholder="Nombre"
        value={formData.name}
        onChange={handleChange}
        className="border border-gray-300 rounded px-1 py-0.5"
      />

      {/* Género */}
      <select
        name="gender"
        value={formData.gender}
        onChange={handleChange}
        className="border border-gray-300 rounded px-1 py-0.5"
      >
        <option value="hombre">Hombre</option>
        <option value="dama">Dama</option>
        <option value="ambas">Ambas</option>
      </select>

      {/* Precio */}
      <input
        type="text"
        name="price"
        placeholder="Precio"
        value={formData.price}
        onChange={handleChange}
        className="border border-gray-300 rounded px-1 py-0.5"
      />

      {/* Mensaje */}
      <textarea
        name="message"
        placeholder="Mensaje"
        value={formData.message}
        onChange={handleChange}
        rows="2"
        className="border border-gray-300 rounded px-1 py-0.5 resize-none"
      />

      {/* Checkbox enviar */}
      <label className="flex items-center gap-1 text-[11px]">
        <input
          type="checkbox"
          name="send"
          checked={formData.send}
          onChange={handleChange}
        />
        Enviar
      </label>

      {/* Botones */}
      <div className="flex gap-1 mt-1">
        <button
          type="submit"
          className="flex-1 bg-blue-500 text-white rounded text-[11px] px-1 py-0.5 hover:bg-blue-600"
        >
          {isEditing ? 'Actualizar' : 'Guardar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-300 text-gray-800 rounded text-[11px] px-1 py-0.5 hover:bg-gray-400"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default CardForm;
