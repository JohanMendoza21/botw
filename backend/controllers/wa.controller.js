// controllers/wa.controller.js
const { initClient, getClient } = require('../services/openwa');

exports.getGroups = async (req, res) => {
  try {
    await initClient();
    const client = getClient();

    // getAllGroups() devuelve solo grupos en OpenWA (método recomendado)
    const groups = await client.getAllGroups();

    const mapped = groups.map((g) => ({
      id: g.id?._serialized || g.id || g.jid || g.chatId,
      name: g.name || g.formattedTitle || g.formattedTitle,
      participantsCount: Array.isArray(g.groupMetadata?.participants)
        ? g.groupMetadata.participants.length
        : (g.participants?.length ?? 0),
    }));

    res.json(mapped);
  } catch (err) {
    console.error('Error getGroups:', err);
    res.status(500).json({ error: 'No se pudieron obtener los grupos', details: err.message });
  }
};
