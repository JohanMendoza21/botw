// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { createDiffusion, getDiffusions } from '../services/diffusionService';
import { startBot as apiStartBot, stopBot as apiStopBot, getBotStatus } from '../services/botService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import DiffusionBox from '../components/DiffusionBox';
import GroupSelector from '../components/GroupSelector';
import BotBox from '../components/BotBox';

function Dashboard() {
  const [containers, setContainers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Grupos globales para el bot ([{id, name}])
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);

  // Intervalo del bot (segundos)
  const [intervalSec, setIntervalSec] = useState(5);

  // Estado del bot
  const [botRunning, setBotRunning] = useState(false);
  const [botQueued, setBotQueued] = useState(0);

  useEffect(() => {
    const fetchContainers = async () => {
      setLoading(true);
      try {
        const diffusions = await getDiffusions();
        const mapped = diffusions.map(d => ({
          id: d._id,
          title: d.title,
          cards: d.cards || [],
          send: d.send ?? false,
          groups: d.groups || [],
        }));
        setContainers(mapped);
      } catch (err) {
        const msg = err?.response?.data?.error || 'No se pudieron cargar las cajas';
        toast.error(`❌ ${msg}`);
      } finally {
        setLoading(false);
      }
    };
    fetchContainers();
  }, []);

  // Crear nueva caja
  const addContainer = async () => {
    const raw = prompt('Nombre de la caja de difusión:');
    if (raw === null) return;
    const title = (raw || '').trim();
    if (!title) return toast.warn('⚠️ Debes escribir un título');

    try {
      const created = await createDiffusion({ title, send: false });
      const newContainer = {
        id: created._id,
        title: created.title,
        cards: [],
        send: created.send ?? false,
        groups: created.groups || [],
      };
      setContainers(prev => [newContainer, ...prev]);
      toast.success('✅ Caja de difusión creada');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Error al crear la caja';
      const details = err?.response?.data?.details;
      toast.error(`❌ ${msg}${details ? `: ${details}` : ''}`);
    }
  };

  // Iniciar bot (optimistic UI)
  const handleStartBot = async () => {
    try {
      if (!selectedGroups.length) {
        toast.warn('⚠️ Selecciona al menos un grupo');
        return;
      }

      // Bloquea "Iniciar" al instante
      setBotRunning(true);

      const res = await apiStartBot({
        groups: selectedGroups.map(g => ({ id: g.id, name: g.name })),
        intervalSec,
      });

      if (res.ok) {
        setBotQueued(res.status?.queued ?? 0);
        toast.success('🤖 Bot iniciado');
      } else {
        setBotRunning(false); // revertir si backend falla
        toast.error(`❌ No se pudo iniciar: ${res.error || 'Error desconocido'}`);
      }
    } catch (err) {
      setBotRunning(false); // revertir si hay error
      const msg = err?.response?.data?.error || err.message || 'Error al iniciar el bot';
      toast.error(`❌ ${msg}`);
    }
  };

  // Detener bot (optimistic UI)
  const handleStopBot = async () => {
    try {
      // Deshabilita "Detener" al instante (y vuelve a habilitar "Iniciar")
      setBotRunning(false);

      const res = await apiStopBot();
      if (res.ok) {
        setBotQueued(0);
        toast('⏹️ Bot detenido');
      } else {
        // Si falla, deja el estado como corriendo
        setBotRunning(true);
        toast.error(`❌ No se pudo detener: ${res.error || 'Error desconocido'}`);
      }
    } catch (err) {
      setBotRunning(true); // revertir a corriendo si error
      const msg = err?.response?.data?.error || err.message || 'Error al detener el bot';
      toast.error(`❌ ${msg}`);
    }
  };

  // Polling opcional del estado del bot
  useEffect(() => {
    let t;
    const tick = async () => {
      try {
        const res = await getBotStatus();
        const running = !!res?.status?.running;
        setBotRunning(running);
        setBotQueued(res?.status?.queued ?? 0);
      } catch {}
      t = setTimeout(tick, 3000);
    };
    tick();
    return () => clearTimeout(t);
  }, []);

  // Memo para pasar al BotBox
  const activeSummary = useMemo(() => {
    return {
      containers,
      groups: selectedGroups,
    };
  }, [containers, selectedGroups]);

  return (
    <div className="p-6 min-h-screen bg-gray-100">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">📦 Configurador de Difusiones</h1>
        <div className="flex gap-2">
          <button
            onClick={addContainer}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow transition"
          >
            + Añadir Caja de Difusión
          </button>
          <button
            onClick={() => setShowGroupSelector(true)}
            className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm"
          >
            📋 Seleccionar grupos
          </button>
        </div>
      </div>

      {/* Chips de grupos globales */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Grupos seleccionados</h3>
        {selectedGroups.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedGroups.map(g => (
              <span
                key={g.id}
                className="text-[11px] px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                {g.name || g.id}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-500">No hay grupos seleccionados.</p>
        )}
      </div>

      {/* Lista vertical de DiffusionBox */}
      {loading ? (
        <div className="text-sm text-gray-600">Cargando difusiones...</div>
      ) : containers.length === 0 ? (
        <div className="text-sm text-gray-600">
          No tienes difusiones aún. Crea una con el botón “Añadir Caja de Difusión”.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {containers.map(container => (
            <DiffusionBox
              key={container.id}
              container={container}
              setContainers={setContainers}
            />
          ))}
        </div>
      )}

      {/* BotBox: resumen e inicio/parada */}
      <div className="mt-6">
        <BotBox
          containers={activeSummary.containers}
          selectedGroups={activeSummary.groups}
          intervalSec={intervalSec}
          setIntervalSec={setIntervalSec}
          onStart={handleStartBot}
          onStop={handleStopBot}
          botRunning={botRunning}   // ← ahora sí se pasan
          botQueued={botQueued}     // ← y la cola también
        />
        {botRunning && (
          <p className="text-xs text-gray-500 mt-2">
            Envíos en curso… en cola: <span className="font-semibold">{botQueued}</span>
          </p>
        )}
      </div>

      {/* Modal de selección de grupos (global) */}
      {showGroupSelector && (
        <GroupSelector
          initialSelected={selectedGroups}
          onApply={(selected) => {
            setSelectedGroups(selected);
            setShowGroupSelector(false);
          }}
          onClose={() => setShowGroupSelector(false)}
        />
      )}
    </div>
  );
}

export default Dashboard;
