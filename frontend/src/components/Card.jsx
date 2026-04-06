// src/components/Card.jsx
import React from 'react';
import { updateCardInDiffusion } from '../services/diffusionService';
import { toast } from 'react-toastify';

function Card({ card, diffusionId, onEdit, onDelete, onToggleSend }) {
  const { _id, image, name, gender, price, message, send } = card;

  const handleToggleSend = async () => {
    try {
      await updateCardInDiffusion(diffusionId, _id, { send: !send });
      onToggleSend(_id, !send);
      toast.success(`✨ ${!send ? 'Listo' : 'Pausado'}`);
    } catch (err) {
      console.error(err);
      toast.error('❌ Error');
    }
  };

  return (
    <div className="group relative bg-[#111827] border border-white/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-cyan-500/10 hover:border-cyan-500/40 transition-all duration-300 flex flex-col w-full aspect-[9/16]">
      
      {/* 🖼️ Header de Imagen (60%) */}
      <div className="relative h-[60%] w-full bg-gray-900 overflow-hidden flex-shrink-0">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500 uppercase italic">
            Sin imagen
          </div>
        )}
        
        {/* Badges Superiores */}
        <div className="absolute top-1 left-1 z-10">
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-cyan-400 border border-white/10 shadow-xl">
            {gender}
          </span>
        </div>
        
        <div className="absolute top-1 right-1 z-10">
          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-cyan-300 border border-white/10 shadow-xl">${price}</span>
        </div>

        {/* 🏷️ NOMBRE FLOTANTE: Ahora vive sobre la imagen para no ocupar espacio abajo */}
        <div className="absolute bottom-0 left-0 w-full p-3 z-20 bg-gradient-to-t from-[#111827] via-[#111827]/80 to-transparent">
          <h3 className="text-sm font-black text-white leading-tight line-clamp-2 drop-shadow-md group-hover:text-cyan-300 transition-colors">
            {name || "Sin nombre"}
          </h3>
        </div>
      </div>

      {/* 📝 Cuerpo de la Card (40% - Ahora mucho más libre) */}
      <div className="p-3 flex flex-col flex-1 min-h-0 justify-between bg-[#111827]">
        
        {/* Mensaje con más espacio */}
        <div className="relative flex flex-col gap-1 mt-auto"> {/* mt-auto lo empuja hacia arriba si hay espacio, o lo mantiene al fondo */}
  {message && (
    <div className="relative group">
      {/* Tooltip opcional o simplemente el texto con libertad de movimiento */}
      <p className="text-[10px] text-gray-400 line-clamp-4 leading-tight italic opacity-80 border-l-2 border-cyan-500/40 pl-2 transition-all duration-300 hover:opacity-100 hover:text-gray-200">
        "{message}"
      </p>  
      
      {/* Si el mensaje es MUY largo y quieres que al pasar el mouse se vea TODO 
        sin romper la tarjeta, puedes usar este truquito:
      */}
      {/* <div className="absolute bottom-full left-0 mb-2 w-full bg-[#0f172a] p-2 rounded-lg border border-cyan-500/20 text-[9px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
        {message}
      </div> */}
    </div>
  )}
</div>

        {/* 🛠️ Footer de Acciones (Bien distribuido) */}
        <div className="flex flex-col gap-2 pt-2">
          
          <button
            onClick={handleToggleSend}
            className={`w-full flex items-center justify-center gap-2 text-[9px] font-black tracking-widest py-2 rounded-lg border transition-all ${
              send
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${send ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
            {send ? 'LISTO' : 'NO ENVIAR'}
          </button>

          <div className="flex gap-2 h-9">
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-white/5 transition-all active:scale-95 text-[10px]"
              title="Editar"
            >
              ✏️ <span className="ml-1 hidden xs:inline">Editar</span>
            </button>
            <button
              onClick={onDelete}
              className="flex-1 flex items-center justify-center rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all active:scale-95 text-[10px]"
              title="Eliminar"
            >
              🗑️ <span className="ml-1 hidden xs:inline">Borrar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;