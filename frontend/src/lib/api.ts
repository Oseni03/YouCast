import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Adjust if your Django server runs on a different port/host
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    // You can adjust how tokens are stored (localStorage, cookies, etc.)
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle global errors, e.g., token refresh logic could go here
    if (error.response?.status === 401) {
        // e.g. clear local storage and redirect to login
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            // window.location.href = '/auth'; // Only if needed globally
        }
    }
    return Promise.reject(error);
  }
);

export default api;
