/**
 * Authentication service — wraps all auth-related API calls.
 */
import api from './api';

/**
 * Register a new user.
 * @param {{ full_name: string, email: string, password: string, confirm_password: string }} data
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const register = (data) => api.post('/auth/register', data);

/**
 * Log in with email and password.
 * @param {{ email: string, password: string }} data
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const login = (data) => api.post('/auth/login', data);

/**
 * Log out — clears the auth cookie.
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const logout = () => api.post('/auth/logout');

/**
 * Fetch the current authenticated user's profile.
 * @returns {Promise<import('axios').AxiosResponse>}
 */
export const getMe = () => api.get('/auth/me');
