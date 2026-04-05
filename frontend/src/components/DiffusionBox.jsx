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

  // UI state
  const [expanded, setExpanded] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Title editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title || '');
  const [savingTitle, setSavingTitle] = useState(false);

  const toggleExpand = () => setExpanded(v => !v);

  // Persist send toggle (caja) y sincronizar con respuesta del backend
  const toggleSend = async () => {
    try {
      const updated = await updateDiffusion(id, { send: !send });
      setContainers(prev =>
        prev.map(c => (c.id === id ? { ...c, send: updated.send } : c))
      );
      toast.success(updated.send ? '✅ Difusión activada' : '⏸️ Difusión desactivada');
    } catch {
      toast.error('❌ No se pudo actualizar el estado');
    }
  };

  // Guardar título
  const handleSaveTitle = async () => {
    const newTitle = (tempTitle || '').trim();
    if (!newTitle) {
      toast.warn('⚠️ El título no puede estar vacío');
      return;
    }
    try {
      setSavingTitle(true);
      const updated = await updateDiffusion(id, { title: newTitle });
      setContainers(prev => prev.map(c => (c.id === id ? { ...c, title: updated.title } : c)));
      setEditingTitle(false);
      toast.success('✅ Título actualizado');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Error al actualizar el título';
      const details = err?.response?.data?.details;
      toast.error(`❌ ${msg}${details ? `: ${details}` : ''}`);
    } finally {
      setSavingTitle(false);
    }
  };

  const handleCancelTitle = () => {
    setTempTitle(title || '');
    setEditingTitle(false);
  };

  // Crear tarjeta
  const handleSaveCreate = async (cardData) => {
    try {
      const newCard = await addCardToDiffusion(id, cardData);
      setContainers(prev =>
        prev.map(c => (c.id === id ? { ...c, cards: [...c.cards, newCard] } : c))
      );
      setShowCreateForm(false);
      toast.success('✅ Tarjeta creada');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Error al crear la tarjeta';
      const details = err?.response?.data?.details;
      toast.error(`❌ ${msg}${details ? `: ${details}` : ''}`);
    }
  };

  // Eliminar tarjeta
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
      toast.success('🗑️ Tarjeta eliminada');
    } catch {
      toast.error('❌ No se pudo eliminar la tarjeta');
    }
  };

  // Edición inline de tarjeta
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
      toast.success('✅ Tarjeta actualizada');
      setEditingCardId(null);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Error al actualizar tarjeta';
      const details = err?.response?.data?.details;
      toast.error(`❌ ${msg}${details ? `: ${details}` : ''}`);
    } finally {
      setSavingEdit(false);
    }
  };

  // Toggle send de una Card (actualiza solo estado local; la BDD se actualiza desde Card.jsx)
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

  // Eliminar caja
  const handleDeleteBox = async () => {
    if (!window.confirm(`¿Eliminar la difusión "${title}" y sus tarjetas?`)) return;
    try {
      await deleteDiffusion(id);
      setContainers(prev => prev.filter(c => c.id !== id));
      toast.success('🗑️ Difusión eliminada');
    } catch {
      toast.error('❌ No se pudo eliminar la difusión');
    }
  };

  // --- Ordenar tarjetas A→Z por nombre (sin mutar el array original)
  const sortedCards = (cards || [])
    .slice()
    .sort((a, b) =>
      (a?.name || '').localeCompare((b?.name || ''), 'es', { sensitivity: 'base' })
    );

  return (
    <div className="w-full bg-white rounded-xl shadow p-4 flex flex-col gap-4 border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Título editable con icono en hover */}
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                className="text-lg font-semibold text-gray-800 border rounded px-2 py-1 w-full max-w-md"
                placeholder="Título de la difusión"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                disabled={savingTitle}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                title="Guardar título"
              >
                ✓
              </button>
              <button
                onClick={handleCancelTitle}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                title="Cancelar"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h2 className="text-lg font-bold text-gray-800">{title}</h2>
              <button
                onClick={() => setEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-gray-700"
                title="Editar título"
              >
                ✎
              </button>
            </div>
          )}

          <p className="text-sm text-gray-500 mt-1">
            {cards.length} {cards.length === 1 ? 'plantilla' : 'plantillas'}
          </p>
        </div>

        <span className={`text-xs px-2 py-1 rounded-full ${send ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
          {send ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={toggleSend}
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm
            ${send
              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
        >
          {send ? '⏸️ Desactivar' : '▶️ Activar'}
        </button>

        <button
          onClick={handleDeleteBox}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
        >
          🗑️ Eliminar
        </button>

        <button
          onClick={toggleExpand}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200"
        >
          {expanded ? '▲ Ocultar' : '▼ Ver más'}
        </button>
      </div>

      {/* Contenido */}
      {expanded && (
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex flex-wrap gap-3 w-max min-w-full">
            {/* Slot de creación como primera tarjeta */}
            <div className="w-36 flex-shrink-0">
              {showCreateForm ? (
                <CardForm
                  onSave={handleSaveCreate}
                  onCancel={() => setShowCreateForm(false)}
                />
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full h-full border-2 border-dashed border-blue-400 text-blue-500 text-sm rounded-lg flex flex-col items-center justify-center p-3 hover:bg-blue-50 transition"
                >
                  <span className="text-2xl font-bold">+</span>
                  <span className="text-xs mt-1">Nueva Tarjeta</span>
                </button>
              )}
            </div>

            {/* Tarjetas existentes (ordenadas A→Z). Cada una puede volverse CardForm si está en edición */}
            {sortedCards.map((card) => {
              const cid = card._id || card.id;
              const isEditing = editingCardId === cid;

              return (
                <div key={cid} className="w-36 flex-shrink-0">
                  {isEditing ? (
                    <CardForm
                      initialValues={card}
                      isEditing
                      onSave={(data) => saveEdit(cid, data)}
                      onCancel={cancelEdit}
                    />
                  ) : (
                    <Card
                      card={card}
                      diffusionId={id}
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
            <div className="text-xs text-gray-500 mt-2">Guardando cambios…</div>
          )}
        </div>
      )}
    </div>
  );
}

export default DiffusionBox;
