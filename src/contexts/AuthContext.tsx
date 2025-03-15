// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, refreshToken } from '../services/api';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  // Charger le token stocké au démarrage
  useEffect(() => {
    (async () => {
      const storedToken = await SecureStore.getItemAsync('userToken');
      if (storedToken) {
        setToken(storedToken);
      }
    })();
  }, []);

  // Fonction de connexion : appelle loginUser et sauvegarde les tokens
  const login = async (username: string, password: string) => {
    try {
      const tokenData = await loginUser(username, password);
      setToken(tokenData.access_token);
      // Vous pouvez aussi sauvegarder le refresh token ici
      await SecureStore.setItemAsync('userRefreshToken', tokenData.refresh_token, { keychainAccessible: SecureStore.ALWAYS });
    } catch (error) {
      console.error("Erreur lors du login :", error);
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    setToken(null);
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userRefreshToken');
  };

  // Fonction de rafraîchissement du token
  const refresh = async () => {
    try {
      const tokenData = await refreshToken();
      setToken(tokenData.access_token);
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token :", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    token,
    isAuthenticated: !!token,
    login,
    logout,
    refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};