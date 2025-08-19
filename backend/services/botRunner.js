// services/botRunner.js
const Diffusion = require('../models/DiffusionBox');
const { initClient, getClient } = require('./openwa');
const { composeCardMessage, normalizeImageForOpenWA } = require('../utils/botMessage');

let running = false;
let timer = null;
let queue = []; // elementos a enviar: { to, card, boxTitle }
let lastTickAt = null;

function isRunning() {
  return running;
}

function getStatus() {
  return {
    running,
    queued: queue.length,
    lastTickAt,
    nextInSec: running && timer ? 'en breve' : null,
  };
}

/**
 * Construye la cola a partir de:
 * - Difusiones send:true
 * - Cards send:true
 * - Grupos seleccionados (array de ids)
 */
async function buildQueue(groupIds) {
  const diffusions = await Diffusion.find({ send: true })
    .populate('cards')
    .lean();

  const items = [];
  for (const box of diffusions) {
    const activeCards = (box.cards || []).filter((c) => c.send);
    for (const card of activeCards) {
      for (const gid of groupIds) {
        items.push({ to: gid, card, boxTitle: box.title });
      }
    }
  }
  return items;
}

/**
 * Inicia el bot: arma la cola y dispara el intervalo
 */
async function startBot({ groups = [], intervalSec = 5 }) {
  if (running) throw new Error('El bot ya está corriendo');
  if (!Array.isArray(groups) || groups.length === 0) throw new Error('Debes enviar al menos un grupo');
  const sec = Math.max(1, Number(intervalSec || 1));

  await initClient();
  const client = getClient();

  queue = await buildQueue(groups);

  if (queue.length === 0) {
    throw new Error('No hay nada para enviar (revisa que haya difusiones y tarjetas activas)');
  }

  running = true;

  timer = setInterval(async () => {
    lastTickAt = new Date();
    if (queue.length === 0) {
      stopBot();
      console.log('✅ Cola finalizada');
      return;
    }

    const item = queue.shift();
    try {
      const { to, card } = item;

      const caption = composeCardMessage(card);
      const img = normalizeImageForOpenWA(card);

      if (img?.dataUrl) {
        // Enviar imagen con pie
        await client.sendImage(to, img.dataUrl, img.filename, caption || undefined);
      } else {
        // Enviar solo texto si no hay imagen
        await client.sendText(to, caption || '(sin contenido)');
      }

      console.log(`➡️  Enviado a ${to} | ${card?.name || 'Sin nombre'}`);
    } catch (err) {
      console.error('❌ Error enviando item:', err.message);
      // Opcional: push a una "dead letter queue" o log de fallos
    }
  }, sec * 1000);
}

function stopBot() {
  if (timer) clearInterval(timer);
  timer = null;
  running = false;
  queue = [];
}

module.exports = { startBot, stopBot, isRunning, getStatus };
