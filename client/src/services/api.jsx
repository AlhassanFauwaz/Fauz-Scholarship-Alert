import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://fauz-scholarship-alert-1.onrender.com',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('soas_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
