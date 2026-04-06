// src/components/BotBox.jsx
import React, { useMemo } from 'react';

export function composeCardMessage(card) {
  const lines = [];
  if (card.name) lines.push(`*${card.name.toUpperCase()}*`); // Negrita para WhatsApp
  if (card.price) lines.push(`💰 *Precio:* $${card.price}`);
  if (card.message) lines.push(`\n${card.message}`);
  return lines.join('\n');
}

function BotBox({
  containers = [],
  selectedGroups = [],
  intervalSec,
  setIntervalSec,
  onStart,
  onStop,
  botRunning = false,
  botQueued = 0
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
    <div className="relative bg-[#0f172a]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl p-6 overflow-hidden">
      
      {/* 🌌 Decoración de fondo (Brillo sutil) */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[100px] transition-colors duration-1000 ${botRunning ? 'bg-emerald-500/20' : 'bg-rose-500/10'}`} />

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-2">
            <span className={botRunning ? 'animate-pulse text-emerald-400' : 'text-gray-500'}>⚡</span>
            Estado del Sistema
          </h3>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Core Engine v3.0</p>
        </div>
        
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-500 ${
          botRunning 
          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
          : 'bg-white/5 border-white/10 text-gray-500'
        }`}>
          <div className={`w-2 h-2 rounded-full ${botRunning ? 'bg-emerald-400 animate-ping' : 'bg-gray-600'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {botRunning ? 'En Transmisión' : 'Standby'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PANEL IZQUIERDO: Configuración y Grupos */}
        <div className="space-y-6">
          {/* Chips de grupos */}
          <div>
            <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-3">Canales de Salida</h4>
            <div className="flex flex-wrap gap-2">
              {selectedGroups.length > 0 ? (
                selectedGroups.map(g => (
                  <span key={g.id} className="text-[10px] font-bold px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:border-cyan-500/30 transition-colors">
                    @{g.name || g.id}
                  </span>
                ))
              ) : (
                <span className="text-xs text-rose-400 font-bold animate-bounce">⚠️ NINGÚN GRUPO SELECCIONADO</span>
              )}
            </div>
          </div>

          {/* Intervalo */}
          <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Frecuencia de Envío (Segundos)</span>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="3"
                  max="60"
                  step="1"
                  value={intervalSec}
                  onChange={(e) => setIntervalSec(Number(e.target.value))}
                  disabled={botRunning}
                  className="flex-1 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 disabled:opacity-30"
                />
                <span className="text-2xl font-black text-white w-12">{intervalSec}s</span>
              </div>
            </label>
          </div>
        </div>

        {/* PANEL DERECHO: Resumen de Carga */}
        <div className="bg-black/20 rounded-[2rem] border border-white/5 p-5">
          <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest mb-4">Payload / Difusiones</h4>
          
          <div className="space-y-3 max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
            {summary.byBox.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-gray-600 font-bold italic">Esperando órdenes...</p>
              </div>
            ) : (
              summary.byBox.map(b => (
                <div key={b.id} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl px-4 py-3 group hover:border-cyan-500/20 transition-all">
                  <span className="text-xs font-black text-gray-300 uppercase italic tracking-tight">{b.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                      {b.cardsCount} items
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {summary.totalCards > 0 && (
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-black text-gray-500 uppercase">Total a enviar</span>
              <span className="text-lg font-black text-white">{summary.totalCards} <span className="text-[10px] text-cyan-500">Plantillas</span></span>
            </div>
          )}
        </div>
      </div>

      {/* CONTROLES DE ACCIÓN (FOOTER) */}
      <div className="mt-8 flex gap-4">
        {!botRunning ? (
          <button
            onClick={onStart}
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-black font-black py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            <span>▶</span> INICIAR SECUENCIA
          </button>
        ) : (
          <button
            onClick={onStop}
            className="flex-1 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-600/30 font-black py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            <span>■</span> ABORTAR MISIÓN
          </button>
        )}
      </div>

      {/* Monitor de Cola (Solo si está corriendo) */}
      {botRunning && (
        <div className="mt-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-center justify-between animate-pulse">
           <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Sincronizando con WhatsApp Web...</span>
           <span className="text-xs font-black text-white uppercase">Cola: {botQueued}</span>
        </div>
      )}
    </div>
  );
}

export default BotBox;