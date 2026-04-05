// src/services/botService.js
import axios from 'axios';

const API_BOT = 'http://localhost:3001/api/bot';

export const startBot = async ({ groups, intervalSec }) => {
  const payload = { groups, intervalSec };
  const res = await axios.post(`${API_BOT}/start`, payload);
  return res.data; // { ok, status }
};

export const stopBot = async () => {
  const res = await axios.post(`${API_BOT}/stop`);
  return res.data; // { ok, status }
};

export const getBotStatus = async () => {
  const res = await axios.get(`${API_BOT}/status`);
  return res.data; // { ok, status: { running, queued, ... } }
};
