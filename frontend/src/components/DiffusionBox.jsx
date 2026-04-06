// src/components/DiffusionBox.jsx
import React, { useState } from 'react';
import Card from './Card';
import CardForm from './CardForm';
import {
  addCardToDiffusion,
  deleteCardFromDiffusion,
  updateCardInDiffusion,
  updateDiffusion,
  deleteDiffusion
} from '../services/diffusionService';
import { toast } from 'react-toastify';

function DiffusionBox({ container, setContainers }) {
  const { id, title, cards, send } = container;

  const [expanded, setExpanded] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title || '');
  const [savingTitle, setSavingTitle] = useState(false);

  const toggleExpand = () => setExpanded(v => !v);

  const toggleSend = async () => {
    try {
      const updated = await updateDiffusion(id, { send: !send });
      setContainers(prev =>
        prev.map(c => (c.id === id ? { ...c, send: updated.send } : c))
      );
      toast.success(updated.send ? '🚀 Transmisión Activada' : '⏸️ Transmisión en Pausa');
    } catch {
      toast.error('❌ Error de conexión');
    }
  };

  const handleSaveTitle = async () => {
    const newTitle = (tempTitle || '').trim();
    if (!newTitle) return toast.warn('⚠️ Título requerido');
    try {
      setSavingTitle(true);
      const updated = await updateDiffusion(id, { title: newTitle });
      setContainers(prev => prev.map(c => (c.id === id ? { ...c, title: updated.title } : c)));
      setEditingTitle(false);
      toast.success('✅ Título actualizado');
    } catch (err) {
      toast.error(`❌ Error al actualizar`);
    } finally {
      setSavingTitle(false);
    }
  };

  const handleCancelTitle = () => {
    setTempTitle(title || '');
    setEditingTitle(false);
  };

  const handleSaveCreate = async (cardData) => {
    try {
      const newCard = await addCardToDiffusion(id, cardData);
      setContainers(prev =>
        prev.map(c => (c.id === id ? { ...c, cards: [...c.cards, newCard] } : c))
      );
      setShowCreateForm(false);
      toast.success('✨ Tarjeta añadida');
    } catch (err) {
      toast.error(`❌ Error al crear`);
    }
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('¿Eliminar esta tarjeta?')) return;
    try {
      await deleteCardFromDiffusion(id, cardId);
      setContainers(prev =>
        prev.map(c =>
          c.id === id
            ? { ...c, cards: c.cards.filter(card => (card._id || card.id) !== cardId) }
            : c
        )
      );
      toast.success('🗑️ Eliminada');
    } catch {
      toast.error('❌ Error al eliminar');
    }
  };

  const startEdit = (card) => setEditingCardId(card._id || card.id);
  const cancelEdit = () => {
    setEditingCardId(null);
    setSavingEdit(false);
  };

  const saveEdit = async (cardId, data) => {
    try {
      setSavingEdit(true);
      const updated = await updateCardInDiffusion(id, cardId, data);
      setContainers(prev =>
        prev.map(box =>
          box.id === id
            ? {
                ...box,
                cards: box.cards.map(c => ((c._id || c.id) === (updated._id || updated.id) ? updated : c)),
              }
            : box
        )
      );
      toast.success('✅ Cambios guardados');
      setEditingCardId(null);
    } catch (err) {
      toast.error(`❌ Error al guardar`);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleCardSend = (cardId, nextSend) => {
    setContainers(prev =>
      prev.map(box =>
        box.id === id
          ? {
              ...box,
              cards: box.cards.map(c =>
                (c._id || c.id) === cardId ? { ...c, send: nextSend } : c
              ),
            }
          : box
      )
    );
  };

  const handleDeleteBox = async () => {
    if (!window.confirm(`¿Borrar "${title}" por completo?`)) return;
    try {
      await deleteDiffusion(id);
      setContainers(prev => prev.filter(c => c.id !== id));
      toast.success('🗑️ Caja eliminada');
    } catch {
      toast.error('❌ Error al eliminar');
    }
  };

  const sortedCards = (cards || [])
    .slice()
    .sort((a, b) =>
      (a?.name || '').localeCompare((b?.name || ''), 'es', { sensitivity: 'base' })
    );

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] p-6 flex flex-col gap-6 backdrop-blur-md transition-all hover:border-cyan-500/20 shadow-xl">
      
      {/* --- HEADER DE LA CAJA --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="bg-[#0f172a] text-xl font-black text-cyan-400 border border-cyan-500/30 rounded-xl px-3 py-1 outline-none"
                autoFocus
              />
              <button onClick={handleSaveTitle} disabled={savingTitle} className="p-2 bg-cyan-500 text-black rounded-lg text-xs">✓</button>
              <button onClick={handleCancelTitle} className="p-2 bg-white/5 text-gray-400 rounded-lg text-xs">✕</button>
            </div>
          ) : (
            <div className="flex items-center gap-3 group">
              <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">
                {title}
              </h2>
              <button
                onClick={() => setEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-cyan-400 text-sm"
              >
                ✏️
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {cards.length} {cards.length === 1 ? 'Plantilla' : 'Plantillas'} Registradas
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${send ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`} />
          </div>
        </div>

        {/* Acciones principales de la caja */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={toggleSend}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              send
                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
                : 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 hover:bg-cyan-400'
            }`}
          >
            {send ? '⏸️ Pausar' : '▶️ Activar'}
          </button>
          <button
            onClick={handleDeleteBox}
            className="p-2.5 bg-white/5 hover:bg-rose-500/20 text-gray-500 hover:text-rose-500 rounded-xl border border-white/5 transition-all"
          >
            🗑️
          </button>
          <button
            onClick={toggleExpand}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl border border-white/5 transition-all"
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* --- CONTENIDO DE TARJETAS --- */}
      {expanded && (
        <div className="relative">
          {/* Sombra para indicar scroll horizontal */}
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#020617] to-transparent z-10 pointer-events-none rounded-r-[2.5rem]" />
          
          <div className="flex gap-5 overflow-x-auto pb-4 pr-12 custom-scrollbar scroll-smooth">
            {/* Slot para crear nueva tarjeta */}
            <div className="w-[180px] min-w-[180px] h-[280px] relative flex-shrink-0">
              {showCreateForm ? (
                <div className="absolute inset-0 bg-[#0f172a] rounded-[2rem] border border-cyan-500/30 overflow-hidden shadow-2xl">
                   <CardForm
                    onSave={handleSaveCreate}
                    onCancel={() => setShowCreateForm(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full h-full border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-gray-500 hover:border-cyan-500/40 hover:text-cyan-400 transition-all bg-white/5 group"
                >
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    +
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">Nuevo Item</span>
                </button>
              )}
            </div>

            {/* Render de las tarjetas existentes */}
            {sortedCards.map((card) => {
              const cid = card._id || card.id;
              const isEditing = editingCardId === cid;

              return (
                <div key={cid} className="w-[180px] min-w-[180px] h-[320px] relative flex-shrink-0">
                  {isEditing ? (
                    <div className="absolute inset-0 bg-[#0f172a] rounded-[2rem] border border-cyan-500/30 overflow-hidden shadow-2xl">
                      <CardForm
                        initialValues={card}
                        isEditing
                        onSave={(data) => saveEdit(cid, data)}
                        onCancel={cancelEdit}
                      />
                    </div>
                  ) : (
                    <Card
                      card={card}
                      onEdit={() => startEdit(card)}
                      onDelete={() => handleDeleteCard(cid)}
                      onToggleSend={handleToggleCardSend}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {savingEdit && (
            <div className="absolute bottom-[-20px] left-0 text-[9px] font-bold text-cyan-500 animate-pulse uppercase tracking-widest">
              Sincronizando cambios con Cerebro Central...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DiffusionBox;