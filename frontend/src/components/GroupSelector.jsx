// src/components/GroupSelector.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { getWaGroups } from '../services/waService';

function GroupSelector({ initialSelected = [], onApply, onClose }) {
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [localSel, setLocalSel] = useState(new Set(initialSelected.map(g => g.id)));

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await getWaGroups(); 
        setGroups(list);
      } catch (err) {
        console.error("Error cargando grupos:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setLocalSel(new Set(initialSelected.map(g => g.id)));
  }, [initialSelected]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return groups;
    return groups.filter(g => (g.name || '').toLowerCase().includes(s));
  }, [groups, search]);

  const toggle = (id) => {
    const next = new Set(localSel);
    next.has(id) ? next.delete(id) : next.add(id);
    setLocalSel(next);
  };

  const removeChip = (id) => {
    const next = new Set(localSel);
    next.delete(id);
    setLocalSel(next);
  };

  const apply = () => {
    const selected = groups.filter(g => localSel.has(g.id));
    onApply?.(selected);
  };

  return (
    <div className="w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
      
      {/* HEADER: Buscador y Cierre */}
      <div className="p-6 border-b border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">
            Seleccionar Canales
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-rose-500 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="relative group">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar grupos por nombre..."
            className="w-full bg-black/40 border border-white/10 focus:border-cyan-500/50 rounded-2xl px-5 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-600 shadow-inner"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-cyan-500 transition-colors">
            🔍
          </div>
        </div>
      </div>

      {/* CHIPS SELECCIONADOS (Área dinámica) */}
      <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5">
        <div className="flex flex-wrap gap-2 min-h-[32px] items-center">
          {Array.from(localSel).length > 0 ? (
            Array.from(localSel).map(id => {
              const g = groups.find(x => x.id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(34,211,238,0.05)]"
                >
                  {g?.name || id}
                  <button
                    onClick={() => removeChip(id)}
                    className="hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </span>
              );
            })
          ) : (
            <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest italic">
              Sin objetivos seleccionados
            </span>
          )}
        </div>
      </div>

      {/* LISTA DE GRUPOS */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
             <div className="w-8 h-8 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
             <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest animate-pulse">Sincronizando WhatsApp...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xs text-gray-600 font-bold uppercase tracking-widest italic">No se encontraron coincidencias</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {filtered.map(g => (
              <div 
                key={g.id} 
                onClick={() => toggle(g.id)}
                className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border group ${
                  localSel.has(g.id) 
                  ? 'bg-cyan-500/5 border-cyan-500/30' 
                  : 'hover:bg-white/5 border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                    localSel.has(g.id) 
                    ? 'bg-cyan-500 border-cyan-500' 
                    : 'border-white/10 group-hover:border-white/20'
                  }`}>
                    {localSel.has(g.id) && <span className="text-[10px] text-black font-black">✓</span>}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold transition-colors ${localSel.has(g.id) ? 'text-white' : 'text-gray-400'}`}>
                      {g.name}
                    </span>
                    <span className="text-[10px] text-gray-600 font-bold uppercase">
                      {g.participantsCount ?? 0} Suscriptores
                    </span>
                  </div>
                </div>
                
                {localSel.has(g.id) && (
                  <span className="text-[9px] font-black text-cyan-500 uppercase tracking-tighter animate-pulse">
                    READY
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER: Acciones */}
      <div className="p-6 border-t border-white/5 flex items-center justify-between bg-black/20">
        <div>
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
            {localSel.size} {localSel.size === 1 ? 'Objetivo' : 'Objetivos'}
          </span>
          <p className="text-[9px] text-gray-700 font-bold uppercase tracking-tighter">Preparado para transmisión</p>
        </div>
        <button
          onClick={apply}
          className="px-10 py-3 bg-cyan-600 hover:bg-cyan-500 text-black font-black text-[11px] uppercase rounded-2xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.2)] active:scale-95 tracking-[0.2em]"
        >
          Aplicar Configuración
        </button>
      </div>
    </div>
  );
}

export default GroupSelector;