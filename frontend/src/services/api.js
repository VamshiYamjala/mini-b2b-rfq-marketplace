import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true, // Crucial for cross-origin cookie / session transmission
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for consistent error extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns a structured error envelope
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    // Fallback error object for network issues / CORS failure
    return Promise.reject({
      success: false,
      message: error.message || 'Network error occurred. Please check your connection.',
      errors: []
    });
  }
);

export default api;
