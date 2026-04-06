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
  const [showGroupSelector, setShowGroupSelector] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [intervalSec, setIntervalSec] = useState(5);
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
        toast.error(`❌ No se pudieron cargar las cajas`);
      } finally {
        setLoading(false);
      }
    };
    fetchContainers();
  }, []);

  const addContainer = async () => {
    const raw = prompt('Nombre de la caja de difusión:');
    if (raw === null) return;
    const title = (raw || '').trim();
    if (!title) return toast.warn('⚠️ Escribe un título');

    try {
      const created = await createDiffusion({ title, send: false });
      setContainers(prev => [{
        id: created._id,
        title: created.title,
        cards: [],
        send: created.send ?? false,
        groups: created.groups || [],
      }, ...prev]);
      toast.success('✅ Caja creada');
    } catch (err) {
      toast.error(`❌ Error al crear la caja`);
    }
  };

  const handleStartBot = async () => {
    try {
      if (!selectedGroups.length) return toast.warn('⚠️ Selecciona grupos');
      setBotRunning(true);
      const res = await apiStartBot({
        groups: selectedGroups.map(g => ({ id: g.id, name: g.name })),
        intervalSec,
      });
      if (res.ok) {
        setBotQueued(res.status?.queued ?? 0);
        toast.success('🤖 Bot iniciado');
      } else {
        setBotRunning(false);
        toast.error(`❌ Error: ${res.error}`);
      }
    } catch (err) {
      setBotRunning(false);
      toast.error(`❌ Error al iniciar bot`);
    }
  };

  const handleStopBot = async () => {
    try {
      setBotRunning(false);
      const res = await apiStopBot();
      if (res.ok) {
        setBotQueued(0);
        toast('⏹️ Bot detenido');
      } else {
        setBotRunning(true);
        toast.error(`❌ Error al detener`);
      }
    } catch (err) {
      setBotRunning(true);
      toast.error(`❌ Error de conexión`);
    }
  };

  useEffect(() => {
    let t;
    const tick = async () => {
      try {
        const res = await getBotStatus();
        setBotRunning(!!res?.status?.running);
        setBotQueued(res?.status?.queued ?? 0);
      } catch {}
      t = setTimeout(tick, 3000);
    };
    tick();
    return () => clearTimeout(t);
  }, []);

  const activeSummary = useMemo(() => ({ containers, groups: selectedGroups }), [containers, selectedGroups]);

  return (
    <div className="min-h-screen bg-[#020617] text-gray-200 font-sans p-4 md:p-8">
      
      <div className="max-w-[1400px] mx-auto space-y-10">
        
        {/* HEADER DINÁMICO */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase leading-none">
              Cerebro <span className="text-cyan-500 not-italic">Central</span>
            </h1>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3 ml-1">
              Terminal de Control de Difusiones
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={addContainer}
              className="px-6 py-4 bg-cyan-600 hover:bg-cyan-500 text-black font-black text-[10px] uppercase rounded-2xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.2)] active:scale-95"
            >
              + Nueva Difusión
            </button>
            <button
              onClick={() => setShowGroupSelector(true)}
              className="px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-black text-[10px] uppercase rounded-2xl transition-all active:scale-95"
            >
              📋 Gestionar Canales
            </button>
          </div>
        </header>

        {/* ÁREA DE CONTENIDO PRINCIPAL (LAYOUT VERTICAL) */}
        <main className="space-y-12">
          
          {/* SECCIÓN DE DIFUSIONES (ANCHO COMPLETO) */}
          <section className="space-y-8">
            <div className="flex items-center gap-4">
               <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Cajas de Inventario</h2>
               <div className="h-px bg-white/5 flex-1" />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20 border border-white/5 rounded-[3rem] bg-white/5">
                 <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest animate-pulse">Sincronizando...</span>
                 </div>
              </div>
            ) : containers.length === 0 ? (
              <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/5">
                <p className="text-gray-500 text-xs font-black uppercase tracking-[0.2em] italic">No se han detectado protocolos de difusión activos</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10">
                {containers.map(container => (
                  <DiffusionBox key={container.id} container={container} setContainers={setContainers} />
                ))}
              </div>
            )}
          </section>

          {/* PANEL DE CONTROL (BOTBOX) AL FINAL - ANCHO COMPLETO */}
          <section className="pt-10">
            <div className="flex items-center gap-4 mb-8">
               <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em]">Consola de Transmisión</h2>
               <div className="h-px bg-white/5 flex-1" />
            </div>
            
            <BotBox
              containers={activeSummary.containers}
              selectedGroups={activeSummary.groups}
              intervalSec={intervalSec}
              setIntervalSec={setIntervalSec}
              onStart={handleStartBot}
              onStop={handleStopBot}
              botRunning={botRunning}
              botQueued={botQueued}
            />
          </section>

        </main>

        {/* FOOTER DE ESTADO */}
        <footer className="py-10 text-center border-t border-white/5">
           <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em]">
             Cerebro Central © 2026 | Sistema de Mensajería Automatizada
           </p>
        </footer>
      </div>

      {/* MODAL SELECTOR */}
      {showGroupSelector && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
           <div className="w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-[3rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <GroupSelector
                initialSelected={selectedGroups}
                onApply={(selected) => {
                  setSelectedGroups(selected);
                  setShowGroupSelector(false);
                }}
                onClose={() => setShowGroupSelector(false)}
              />
           </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 