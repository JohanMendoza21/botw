// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/auth';

/**
 * Inicia sesión con las credenciales del usuario
 * @param {Object} credentials { email, password }
 * @returns {Promise} Respuesta del servidor
 */
export const loginUser = (credentials) => {
  return axios.post(`${API_URL}/login`, credentials);
};

/**
 * Registra un nuevo usuario en el sistema
 * @param {Object} userData { name, email, password }
 * @returns {Promise} Respuesta del servidor
 */
export const registerUser = (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};
