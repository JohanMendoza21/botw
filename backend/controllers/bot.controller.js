// controllers/bot.controller.js
const { startBot, stopBot, isRunning, getStatus } = require('../services/botRunner');

exports.start = async (req, res) => {
  try {
    const { groups, intervalSec } = req.body;

    // groups puede venir como [{id,name}, ...] o [id, id]
    const groupIds = Array.isArray(groups)
      ? groups.map((g) => (typeof g === 'string' ? g : g?.id)).filter(Boolean)
      : [];

    await startBot({ groups: groupIds, intervalSec });
    res.json({ ok: true, status: getStatus() });
  } catch (err) {
    console.error('Error start bot:', err);
    res.status(400).json({ ok: false, error: err.message });
  }
};

exports.stop = (req, res) => {
  try {
    stopBot();
    res.json({ ok: true, status: getStatus() });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
};

exports.status = (req, res) => {
  res.json({ ok: true, status: getStatus() });
};
