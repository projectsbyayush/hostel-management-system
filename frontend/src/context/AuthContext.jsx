import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hms_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('hms_token'));
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (usernameOrEmail, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { usernameOrEmail, password });
      localStorage.setItem('hms_token', data.token);
      localStorage.setItem('hms_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (token) {
      api
        .get('/auth/me')
        .then(({ data }) => {
          setUser(data);
          localStorage.setItem('hms_user', JSON.stringify(data));
        })
        .catch(() => {});
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
