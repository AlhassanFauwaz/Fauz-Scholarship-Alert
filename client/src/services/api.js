import axios from 'axios';

// Vite replaces VITE_API_URL while creating the production bundle.  Do not use
// localhost here: a visitor's browser would interpret it as *their* device.
const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  'https://fauz-scholarship-alert-1.onrender.com/api'
).replace(/\/$/, '');

const API = axios.create({
  baseURL: API_BASE_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('soas_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
