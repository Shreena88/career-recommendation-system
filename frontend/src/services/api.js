/**
 * Axios instance pre-configured for the Career Recommendation API.
 *
 * - Base URL points to the FastAPI backend.
 * - withCredentials ensures HttpOnly cookies are sent with every request.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
