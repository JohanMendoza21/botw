// utils/botMessage.js
function composeCardMessage(card) {
  // Usa card.message si viene; si no, compone uno básico
  if (card.message && card.message.trim()) return card.message.trim();

  const lines = [];
  if (card.name) lines.push(`${card.name}`);
  if (card.price) lines.push(`$${card.price}`);
  // Puedes agregar más campos si quieres
  return lines.join('\n\n');
}

function normalizeImageForOpenWA(card) {
  // OpenWA sendImage soporta dataURL base64, path local o URL
  // Como tú guardas base64 (data URL), lo enviamos así.
  const dataUrl = card.image; // e.g. "data:image/png;base64,...."
  if (!dataUrl) return null;
  // filename requerido por OpenWA (puede ser genérico)
  const filename = `${(card.name || 'producto').replace(/\s+/g, '_')}.jpg`;
  return { dataUrl, filename };
}

module.exports = { composeCardMessage, normalizeImageForOpenWA };
