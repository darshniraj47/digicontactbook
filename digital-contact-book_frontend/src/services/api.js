import axios from 'axios';

// Base API URL pointing to the Flask backend
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the logged-in user ID to outgoing requests
api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('contact_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.id) {
          config.headers['X-User-Id'] = user.id;
        }
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API methods
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/login', credentials);
    return response.data;
  },
};

// Profile & Settings API methods
export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
  updateProfile: async (data) => {
    const response = await api.put('/profile', data);
    return response.data;
  },
  changePassword: async (data) => {
    const response = await api.put('/profile/password', data);
    return response.data;
  },
  getPreferences: async () => {
    const response = await api.get('/preferences');
    return response.data;
  },
  updatePreferences: async (data) => {
    const response = await api.put('/preferences', data);
    return response.data;
  },
  deleteAccount: async () => {
    const response = await api.delete('/account');
    return response.data;
  },
};

// Contact Management API methods
export const contactAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/contacts', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/contacts/${id}`);
    return response.data;
  },
  create: async (contactData) => {
    const response = await api.post('/contacts', contactData);
    return response.data;
  },
  update: async (id, contactData) => {
    const response = await api.put(`/contacts/${id}`, contactData);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/contacts/${id}`);
    return response.data;
  },
  toggleFavorite: async (id) => {
    const response = await api.put(`/contacts/${id}/favorite`);
    return response.data;
  },
  exportCSV: async () => {
    const response = await api.get('/contacts/export', { responseType: 'blob' });
    return response.data;
  },
};

export default api;
