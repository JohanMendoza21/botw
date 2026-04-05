// src/services/waService.js
import axios from 'axios';

const API_WA = 'http://localhost:3001/api/wa';

export const getWaGroups = async () => {
  const res = await axios.get(`${API_WA}/groups`);
  return res.data; // [{ id, name, participantsCount }]
};
