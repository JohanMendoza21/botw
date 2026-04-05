import axios from 'axios';

const API_URL = 'http://localhost:3001/api/diffusions';

// Crear una nueva difusión con sus tarjetas
export const createDiffusion = async (diffusionData) => {
  const response = await axios.post(API_URL, diffusionData);
  return response.data;
};

// Obtener todas las difusiones
export const getDiffusions = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Obtener una difusión por ID
export const getDiffusionById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Actualizar una difusión completa (nombre y tarjetas)
export const updateDiffusion = async (id, updatedData) => {
  const response = await axios.put(`${API_URL}/${id}`, updatedData);
  return response.data;
};

// Eliminar una difusión completa
export const deleteDiffusion = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

// Agregar una tarjeta a una difusión existente
export const addCardToDiffusion = async (diffusionId, cardData) => {
  const response = await axios.post(`${API_URL}/${diffusionId}/cards`, cardData);
  return response.data;
};

// Actualizar una tarjeta específica dentro de una difusión
export const updateCardInDiffusion = async (diffusionId, cardId, cardData) => {
  const response = await axios.put(`${API_URL}/${diffusionId}/cards/${cardId}`, cardData);
  return response.data;
};

// Eliminar una tarjeta de una difusión
export const deleteCardFromDiffusion = async (diffusionId, cardId) => {
  const response = await axios.delete(`${API_URL}/${diffusionId}/cards/${cardId}`);
  return response.data;
};
