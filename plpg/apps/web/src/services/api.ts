import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    // Token injection will be handled by Clerk's useAuth hook
    // For now, we rely on cookies/session
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/';
    }

    if (error.response?.status === 403) {
      // Handle forbidden - show upgrade prompt
      console.error('Access forbidden - subscription required');
    }

    return Promise.reject(error);
  }
);

export default api;
