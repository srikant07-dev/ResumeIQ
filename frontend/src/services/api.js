import axios from 'axios';
import { supabase } from './supabaseClient';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Supabase JWT Bearer token or demo-token to every backend request
api.interceptors.request.use(async (config) => {
  // If payload is FormData, remove Content-Type so browser sets multipart/form-data with proper boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
      config.headers.delete('content-type');
    }
  }

  let token = null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  } catch {}

  if (!token && typeof window !== 'undefined') {
    try {
      const demo = JSON.parse(localStorage.getItem('resumeiq_demo_session') || '{}');
      token = demo?.access_token;
    } catch {}
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => Promise.reject(error));

// Extract human-readable error messages from standard ErrorResponse format
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let customError = error.response?.data?.detail || error.response?.data || {
      code: 'NETWORK_ERROR',
      message: error.message || 'Unable to connect to the server.',
    };

    // If server provided detailed validation errors, format them into the message
    if (customError && typeof customError === 'object' && customError.details) {
      if (typeof customError.details === 'object' && !Array.isArray(customError.details)) {
        const detailParts = Object.entries(customError.details)
          .map(([field, msg]) => `${field}: ${msg}`)
          .filter(Boolean);
        if (detailParts.length > 0) {
          const baseMsg = (customError.message || 'Validation error').replace(/[:.]\s*$/, '');
          customError = {
            ...customError,
            message: `${baseMsg}: ${detailParts.join('; ')}`,
          };
        }
      }
    }

    return Promise.reject(customError);
  }
);

export default api;
