import { createContext, useContext, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('fdk_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const loginWithTelegram = useCallback(async (telegramData) => {
    const { data } = await api.post('/auth/telegram', telegramData);
    localStorage.setItem('fdk_token', data.token);
    localStorage.setItem('fdk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const loginWithDev = useCallback(async (profile) => {
    const { data } = await api.post('/auth/dev-login', profile);
    localStorage.setItem('fdk_token', data.token);
    localStorage.setItem('fdk_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('fdk_token');
    localStorage.removeItem('fdk_user');
    setUser(null);
  }, []);

  const refreshUser = useCallback((updatedUser) => {
    localStorage.setItem('fdk_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginWithTelegram, loginWithDev, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
