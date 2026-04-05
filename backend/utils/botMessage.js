// utils/botMessage.js
function composeCardMessage(card) {
  // Si el mensaje personalizado existe, lo limpiamos igual
  const customMessage = card.message?.trim() || '';

  const lines = [];

  // Nombre en negrita
  if (card.name) lines.push(`*${card.name}*`);

  // Género o tipo de tallas
  if (card.gender) {
    if (card.gender === 'hombre') lines.push('Tallas de hombre');
    else if (card.gender === 'dama') lines.push('Tallas de dama');
    else if (card.gender === 'ambas') lines.push('Tallas de hombre y dama');
  }

  // Precio
  if (card.price) lines.push(`$${card.price}`);

  // Mensaje adicional (si lo hay)
  if (customMessage) {
    lines.push(''); // salto de línea
    lines.push(customMessage);
  }

  return lines.join('\n');
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
