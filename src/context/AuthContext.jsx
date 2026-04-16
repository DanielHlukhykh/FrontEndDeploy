import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { loginUser, registerUser, getCustomer, updateCustomer } from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fittrack_token'));
  const [loading, setLoading] = useState(true);

  // При маунте или смене токена — загружаем профиль
  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchUser = async () => {
      try {
        const data = await getCustomer();
        if (!cancelled) {
          setUser(data);
          localStorage.setItem('fittrack_user', JSON.stringify(data));
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        if (!cancelled) {
          localStorage.removeItem('fittrack_token');
          localStorage.removeItem('fittrack_user');
          setToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchUser();
    return () => { cancelled = true; };
  }, [token]);

  const login = useCallback(async (loginOrEmail, password) => {
    try {
      const data = await loginUser(loginOrEmail, password);

      // Бекенд возвращает { success: true, token: "Bearer ..." }
      if (!data.success) {
        return { success: false, error: data.message || 'Login failed' };
      }

      const jwtToken = data.token;
      localStorage.setItem('fittrack_token', jwtToken);
      setToken(jwtToken);

      // Загружаем профиль
      const profile = await getCustomer();
      setUser(profile);
      localStorage.setItem('fittrack_user', JSON.stringify(profile));

      return { success: true };
    } catch (err) {
      const errors = err.data;
      let message = err.message || 'Login failed';

      if (errors && typeof errors === 'object') {
        // Бекенд может вернуть { loginOrEmail: "...", password: "..." }
        const msgs = [];
        if (errors.loginOrEmail) msgs.push(errors.loginOrEmail);
        if (errors.password) msgs.push(errors.password);
        if (errors.message) msgs.push(errors.message);
        if (msgs.length > 0) message = msgs.join('. ');
      }

      return { success: false, error: message };
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      await registerUser(userData);

      // Авто-логин после регистрации
      const loginResult = await login(userData.login || userData.email, userData.password);
      return loginResult;
    } catch (err) {
      const errors = err.data;
      let message = 'Registration failed';

      if (errors && typeof errors === 'object') {
        const allMsgs = [];
        for (const [, val] of Object.entries(errors)) {
          if (Array.isArray(val)) {
            allMsgs.push(...val);
          } else if (typeof val === 'string') {
            allMsgs.push(val);
          }
        }
        if (allMsgs.length > 0) message = allMsgs.join('. ');
      }

      return { success: false, error: message };
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('fittrack_token');
    localStorage.removeItem('fittrack_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data) => {
    try {
      const updated = await updateCustomer(data);
      setUser(updated);
      localStorage.setItem('fittrack_user', JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.data?.message || err.message || 'Update failed',
      };
    }
  }, []);

  // Обновить данные текущего пользователя (followers/following и т.д.)
  const refreshUser = useCallback(async () => {
    try {
      const data = await getCustomer();
      setUser(data);
      localStorage.setItem('fittrack_user', JSON.stringify(data));
    } catch (err) {
      console.error('Refresh user failed:', err);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;