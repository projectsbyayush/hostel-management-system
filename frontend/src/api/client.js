import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('hms_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('hms_token');
      localStorage.removeItem('hms_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export function getErrorMessage(error) {
  if (error.response) {
    const data = error.response.data;
    if (data && data.details && data.details.length) {
      return data.details.join('; ');
    }
    if (data && data.message) {
      return data.message;
    }
    return `Request failed (${error.response.status})`;
  }
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Is the backend running?';
  }
  return 'Cannot reach the server. Check that the backend is running on port 8080.';
}
