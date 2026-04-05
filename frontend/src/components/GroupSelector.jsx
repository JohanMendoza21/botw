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
        const list = await getWaGroups(); // [{id,name,participantsCount}]
        setGroups(list);
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
    const selected = groups.filter(g => localSel.has(g.id)); // [{id,name,...}]
    onApply?.(selected);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
      <div className="w-[min(34rem,95vw)] bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar grupo…"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={onClose}
            className="px-3 py-2 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>

        {/* Chips seleccionados */}
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            {Array.from(localSel).map(id => {
              const g = groups.find(x => x.id === id);
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {g?.name || id}
                  <button
                    onClick={() => removeChip(id)}
                    className="ml-1 hover:text-indigo-900"
                    title="Quitar"
                  >
                    ✕
                  </button>
                </span>
              );
            })}
            {localSel.size === 0 && (
              <span className="text-xs text-gray-500">Sin grupos seleccionados</span>
            )}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-gray-500">Cargando grupos…</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">No hay resultados</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map(g => (
                <li key={g.id} className="flex items-center justify-between p-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localSel.has(g.id)}
                      onChange={() => toggle(g.id)}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-800">{g.name}</span>
                      <span className="text-[11px] text-gray-500">
                        {g.participantsCount ?? 0} miembros
                      </span>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {localSel.size} seleccionado{localSel.size === 1 ? '' : 's'}
          </span>
          <button
            onClick={apply}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupSelector;
