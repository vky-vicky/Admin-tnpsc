import axios from 'axios';

// Create axios instance with default config
const isProduction = import.meta.env.PROD;
const api = axios.create({
  // Use /api proxy for both local and production for consistency
  // In production, always use /api to let Vercel rewrites handle the proxying to HTTP backend
  // This avoids Mixed Content errors (HTTPS frontend -> HTTP backend blocked by browser)
  baseURL: import.meta.env.PROD ? '/api' : (import.meta.env.VITE_API_BASE_URL || '/api'),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // For blob responses, we often need the full response object to get headers (like filename)
    if (response.config.responseType === 'blob') {
      return response;
    }
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      localStorage.removeItem('admin_token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
