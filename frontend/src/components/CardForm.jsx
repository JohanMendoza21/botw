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
      className="w-full h-full bg-[#0f172a] flex flex-col p-4 text-[11px] gap-3 overflow-y-auto custom-scrollbar border border-cyan-500/20 rounded-[2rem]"
    >
      <h4 className="text-[9px] font-black text-cyan-500 uppercase tracking-[0.3em] mb-1 italic text-center">
        {isEditing ? 'Editar Registro' : 'Nuevo Registro'}
      </h4>

      {/* Preview de Imagen */}
      <div className="relative group w-full h-24 min-h-[96px] bg-black/40 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
        {formData.image ? (
          <img src={formData.image} alt="preview" className="h-full w-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
        ) : (
          <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Sin Visualización</span>
        )}
        <label className="absolute inset-0 cursor-pointer flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all">
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">Cambiar</span>
          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </label>
      </div>

      {/* Campos de Texto */}
      <div className="space-y-2">
        <input
          type="text"
          name="name"
          placeholder="MODELO / REFERENCIA"
          value={formData.name}
          onChange={handleChange}
          className="w-full bg-white/5 border border-white/10 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-white outline-none transition-all placeholder:text-gray-700 font-bold uppercase tracking-tight"
        />

        <div className="flex gap-2">
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="flex-1 bg-white/5 border border-white/10 focus:border-cyan-500/50 rounded-lg px-2 py-2 text-gray-300 outline-none transition-all font-bold uppercase text-[9px]"
          >
            <option value="hombre">HOMBRE</option>
            <option value="dama">DAMA</option>
            <option value="ambas">UNISEX</option>
          </select>

          <input
            type="text"
            name="price"
            placeholder="$"
            value={formData.price}
            onChange={handleChange}
            className="w-[40px] bg-white/5 border border-white/10 focus:border-cyan-500/50 rounded-lg px-2 py-2 text-cyan-400 outline-none transition-all placeholder:text-gray-700 font-black"
          />
        </div>

        <textarea
          name="message"
          placeholder="DETALLES DEL MENSAJE (TALLAS, COLORES...)"
          value={formData.message}
          onChange={handleChange}
          rows="3"
          className="w-full bg-white/5 border border-white/10 focus:border-cyan-500/50 rounded-lg px-3 py-2 text-gray-400 outline-none transition-all placeholder:text-gray-700 resize-none italic leading-tight"
        />
      </div>

      {/* Switch Enviar */}
      <label className="flex items-center justify-between px-2 py-2 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Estado de Envío</span>
        <div className="flex items-center gap-2">
           <span className={`text-[8px] font-black uppercase ${formData.send ? 'text-emerald-500' : 'text-gray-600'}`}>
            {formData.send ? 'ON' : 'OFF'}
           </span>
           <input
            type="checkbox"
            name="send"
            checked={formData.send}
            onChange={handleChange}
            className="w-3 h-3 accent-cyan-500"
          />
        </div>
      </label>

      {/* Botones de Acción */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-black rounded-xl text-[10px] py-3 uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
        >
          {isEditing ? 'Actualizar' : 'Agregar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="p-3 bg-white/5 text-gray-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-white/5"
        >
          ✕
        </button>
      </div>
    </form>
  );
}

export default CardForm;