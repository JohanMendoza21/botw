// src/components/WhatsAppQRModal.jsx
import React, { useEffect, useState, useRef } from 'react';

export default function WhatsAppQRModal({ open, onClose }) {
  const [qrData, setQrData] = useState(null); // "data:image/png;base64,...."
  const [expiresAt, setExpiresAt] = useState(null);
  const [status, setStatus] = useState({ connected: false });
  const [loading, setLoading] = useState(false);
  const sseRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    setLoading(true);

    // Primero chequear estado
    fetch('/api/whatsapp/status')
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        setStatus(data);
        if (data.connected) {
          // Ya conectado: cerrar modal
          onClose?.();
          setLoading(false);
        } else {
          // intentar suscribirse por SSE; si no, usar polling
          initSSE();
          fetchQrOnce(); // carga inmediata
          setLoading(false);
        }
      })
      .catch(() => {
        // fallback: polling
        initPolling();
        fetchQrOnce();
        setLoading(false);
      });

    function initSSE() {
      // Si tu backend expone SSE en /api/whatsapp/events
      try {
        if (sseRef.current) sseRef.current.close();
        const es = new EventSource('/api/whatsapp/events');
        sseRef.current = es;
        es.onmessage = (ev) => {
          // mensajes genéricos
          try {
            const msg = JSON.parse(ev.data);
            handleEvent(msg);
          } catch (e) { /* ignore */ }
        };
        es.addEventListener('qr', (ev) => {
          const payload = JSON.parse(ev.data);
          handleEvent({ type: 'qr', ...payload });
        });
        es.addEventListener('authenticated', (ev) => {
          handleEvent({ type: 'authenticated' });
        });
        es.addEventListener('disconnected', (ev) => {
          handleEvent({ type: 'disconnected' });
        });
        es.onerror = () => {
          // si SSE falla, iniciar polling
          es.close();
          initPolling();
        };
      } catch (e) {
        initPolling();
      }
    }

    function initPolling() {
      // polling cada 3s para /api/whatsapp/qr y /api/whatsapp/status
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        await fetchStatus();
        if (!status.connected) {
          await fetchQrOnce();
        }
      }, 3000);
    }

    async function fetchStatus() {
      try {
        const r = await fetch('/api/whatsapp/status');
        const d = await r.json();
        if (!mounted) return;
        setStatus(d);
        if (d.connected) {
          onClose?.();
        }
      } catch {}
    }

    async function fetchQrOnce() {
      try {
        const r = await fetch('/api/whatsapp/qr');
        if (!r.ok) return;
        const d = await r.json();
        if (!mounted) return;
        if (d.qr) setQrData(d.qr);
        if (d.expiresAt) setExpiresAt(new Date(d.expiresAt));
      } catch (err) { /* ignore */ }
    }

    function handleEvent(msg) {
      if (msg.type === 'qr') {
        if (msg.qr) setQrData(msg.qr);
        if (msg.expiresAt) setExpiresAt(new Date(msg.expiresAt));
      } else if (msg.type === 'authenticated') {
        setStatus({ connected: true });
        onClose?.();
      } else if (msg.type === 'disconnected') {
        setStatus({ connected: false });
        // mostrar QR u otro mensaje
      }
    }

    return () => {
      mounted = false;
      if (sseRef.current) sseRef.current.close();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open]);

  // contador simple de expiración
  const [timeLeft, setTimeLeft] = useState(0);
  useEffect(() => {
    if (!expiresAt) return setTimeLeft(0);
    const update = () => {
      const ms = expiresAt - new Date();
      setTimeLeft(ms > 0 ? Math.floor(ms / 1000) : 0);
    };
    update();
    const t = setInterval(update, 500);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3>Conectar WhatsApp</h3>
        <p className="small">Escanea este código QR con WhatsApp Web en tu teléfono.</p>

        <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 240, height: 240, background: '#0b0f13', display: 'grid', placeItems: 'center', borderRadius: 8 }}>
            {qrData ? (
              <img src={qrData} alt="QR WhatsApp" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <div className="small">Generando QR…</div>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <p className="small">1. Abre WhatsApp en tu teléfono → Menú → Dispositivos vinculados → Vincular un dispositivo.</p>
            <p className="small">2. Escanea el código QR que aparece aquí.</p>
            <p className="small" style={{ marginTop: 8 }}>
              Estado: <strong>{status.connected ? 'Conectado' : 'Esperando escaneo'}</strong>
            </p>
            <p className="small">QR expira en: <strong>{timeLeft}s</strong></p>

            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              <button className="btn-primary" onClick={() => {
                // fuerza refresco del QR
                fetch('/api/whatsapp/qr/refresh').then(()=>{}).catch(()=>{});
              }}>Refrescar QR</button>

              <button className="btn btn-ghost" onClick={() => { onClose?.(); }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <p className="small">Nota: el QR es temporal. Si no escaneas en el tiempo indicado, pulsa <strong>Refrescar QR</strong>.</p>
        </div>
      </div>
    </div>
  );
}
