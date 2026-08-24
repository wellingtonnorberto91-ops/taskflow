import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, authStorage } from '../services/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restaura sessão no carregamento inicial
  useEffect(() => {
    async function initAuth() {
      const token = authStorage.getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.success) {
          setUser(response.user);
        }
      } catch (err) {
        console.warn('Sessão expirada ou token inválido');
        authStorage.removeToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      if (response.success && response.token) {
        authStorage.setToken(response.token);
        setUser(response.user);
        return { success: true };
      }
      throw new Error(response.message || 'Falha ao autenticar');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const response = await authApi.register({ name, email, password });
      if (response.success && response.token) {
        authStorage.setToken(response.token);
        setUser(response.user);
        return { success: true };
      }
      throw new Error(response.message || 'Falha ao registrar usuário');
    } catch (err) {
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    authStorage.removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: !!user,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
