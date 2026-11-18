/**
 * AuthContext — manages authentication state across the React app.
 *
 * On mount, it calls GET /auth/me to check for an existing session cookie.
 * Provides user, loading, login, register, and logout to all descendants.
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while checking session

  // Check existing session on mount
  useEffect(() => {
    let cancelled = false;
    authService
      .getMe()
      .then((res) => {
        if (!cancelled) setUser(res.data);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    setUser(res.data);
    return res.data;
  }, []);

  const register = useCallback(async (full_name, email, password, confirm_password) => {
    const res = await authService.register({ full_name, email, password, confirm_password });
    setUser(res.data);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
