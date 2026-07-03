import axios from 'axios';

const api = axios.create({
  baseURL: 'https://virtualnest-backend.onrender.com/api',
  timeout: 10000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('vn_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('vn_token');
      localStorage.removeItem('vn_user');
      // Only redirect if not already on the login page to prevent looping
      if (!window.location.pathname.endsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
