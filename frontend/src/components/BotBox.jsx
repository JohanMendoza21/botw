// src/components/BotBox.jsx
import React, { useMemo } from 'react';

export function composeCardMessage(card) {
  const lines = [];
  if (card.name) lines.push(`${card.name}`);
  if (card.price) lines.push(`$${card.price}`);
  if (card.message) lines.push(card.message);
  return lines.join('\n\n');
}

function BotBox({
  containers = [],         // todas las difusiones
  selectedGroups = [],     // [{id,name}]
  intervalSec,             // número
  setIntervalSec,          // setter
  onStart,                 // () => void
  onStop,                  // () => void
  botRunning = false,      // nuevo
  botQueued = 0            // nuevo
}) {
  const summary = useMemo(() => {
    const activeBoxes = containers.filter(d => d.send);
    const byBox = activeBoxes.map(box => {
      const activeCards = (box.cards || []).filter(c => c.send);
      return {
        id: box.id,
        title: box.title,
        cardsCount: activeCards.length,
        cards: activeCards
      };
    });
    const totalCards = byBox.reduce((acc, b) => acc + b.cardsCount, 0);
    return { byBox, totalCards };
  }, [containers]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-800">🤖 Bot de difusión</h3>
        <span className={`text-xs px-2 py-[2px] rounded-md border ${botRunning
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-gray-50 text-gray-600 border-gray-200'
          }`}>
          {botRunning ? 'En ejecución' : 'Detenido'}
        </span>
      </div>

      {/* Chips de grupos */}
      <div className="flex flex-wrap gap-2 mt-3">
        {selectedGroups.length > 0 ? (
          selectedGroups.map(g => (
            <span key={g.id} className="text-[11px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {g.name || g.id}
            </span>
          ))
        ) : (
          <span className="text-[11px] text-gray-500">No hay grupos seleccionados</span>
        )}
      </div>

      {/* Resumen de difusiones activas */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold text-gray-700">Difusiones activas</h4>
        {summary.byBox.length === 0 ? (
          <p className="text-xs text-gray-500 mt-1">No hay difusiones activas (marca “Activar” en la caja y “Listo para enviar” en las tarjetas).</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {summary.byBox.map(b => (
              <li key={b.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800">{b.title}</span>
                </div>
                <span className="text-xs px-2 py-[2px] rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {b.cardsCount} plantilla{b.cardsCount === 1 ? '' : 's'} listas
                </span>
              </li>
            ))}
          </ul>
        )}
        {summary.totalCards > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Total plantillas a enviar: <span className="font-semibold text-gray-700">{summary.totalCards}</span>
            {botRunning && <> • En cola: <span className="font-semibold">{botQueued}</span></>}
          </p>
        )}
      </div>

      {/* Intervalo y controles */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Intervalo (seg):</span>
          <input
            type="number"
            min={1}
            value={intervalSec}
            onChange={(e) => setIntervalSec(Math.max(1, Number(e.target.value || 1)))}
            disabled={botRunning}
            className="w-24 border rounded-lg px-3 py-2 text-sm disabled:opacity-60"
          />
        </label>

        <div className="sm:ml-auto flex items-center gap-2">
          <button
            onClick={onStart}
            disabled={botRunning}
            className={`px-4 py-2 text-sm rounded-lg ${botRunning
              ? 'bg-emerald-600 text-white opacity-60 cursor-not-allowed'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            ▶️ Iniciar bot
          </button>
          <button
            onClick={onStop}
            disabled={!botRunning}
            className={`px-4 py-2 text-sm rounded-lg ${!botRunning
              ? 'bg-rose-50 text-rose-700 border border-rose-200 opacity-60 cursor-not-allowed'
              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            ⛔ Detener
          </button>
        </div>
      </div>
    </div>
  );
}

export default BotBox;
