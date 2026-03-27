import axios from 'axios';

const api = axios.create({
  // Убедись, что порт 8000 и путь совпадают с твоим urls.py
  baseURL: 'http://127.0.0.1:8000/api/v1/', 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;