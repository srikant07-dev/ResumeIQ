import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Supabase JWT Bearer token to every backend request
api.interceptors.request.use(async (config) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    // If no active session, continue without token (backend will respond 401 on protected routes)
  }
  return config;
}, (error) => Promise.reject(error));

// Extract human-readable error messages from standard ErrorResponse format
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError = error.response?.data?.detail || error.response?.data || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Unable to connect to the server.',
    };
    return Promise.reject(customError);
  }
);

export default api;
