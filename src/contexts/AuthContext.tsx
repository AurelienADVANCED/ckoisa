// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, refreshToken, getPlayerInfo } from '../services/api';
import { jwtDecode } from 'jwt-decode';
import { UserInfo } from '../types/UserInfo';

function getUserIdFromToken(token: string): string | null {
  try {
    const decoded: any = jwtDecode(token);
    return decoded?.sub || null;
  } catch (err) {
    console.error('Erreur décodage token:', err);
    return null;
  }
}

interface AuthContextType {
  token: string | null;
  userId: string | null;
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  refreshUserInfo: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  userInfo: null,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refresh: async () => {},
  refreshUserInfo: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  // Charger le token stocké au démarrage
  useEffect(() => {
    (async () => {
      const storedToken = await SecureStore.getItemAsync('userToken');
      if (storedToken) {
        setToken(storedToken);
        const sub = getUserIdFromToken(storedToken);
        setUserId(sub);
      }
    })();
  }, []);

  // Rafraîchir les infos utilisateur quand le token ou userId change
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !userId) {
        setUserInfo(null);
        return;
      }
      try {
        const data: UserInfo = await getPlayerInfo(token);
        setUserInfo(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
      }
    };

    fetchUserData();
  }, [token, userId]);

  // Fonction de mise à jour manuelle des infos utilisateur
  const refreshUserInfo = async () => {
    if (!token || !userId) return;
    try {
      const data: UserInfo = await getPlayerInfo(token);
      setUserInfo(data);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des infos utilisateur:', error);
    }
  };

  // Fonction de connexion : appelle loginUser et sauvegarde le token
  const login = async (username: string, password: string) => {
    try {
      const tokenData = await loginUser(username, password);
      setToken(tokenData.access_token);
      await SecureStore.setItemAsync('userToken', tokenData.access_token);
      await SecureStore.setItemAsync('userRefreshToken', tokenData.refresh_token, {
        keychainAccessible: SecureStore.ALWAYS,
      });
      const sub = getUserIdFromToken(tokenData.access_token);
      setUserId(sub);
    } catch (error) {
      console.error('Erreur lors du login :', error);
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = async () => {
    setToken(null);
    setUserId(null);
    setUserInfo(null);
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userRefreshToken');
  };

  // Fonction de rafraîchissement du token
  const refresh = async () => {
    try {
      const tokenData = await refreshToken();
      setToken(tokenData.access_token);
      await SecureStore.setItemAsync('userToken', tokenData.access_token);
      const sub = getUserIdFromToken(tokenData.access_token);
      setUserId(sub);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token :', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    token,
    userId,
    userInfo,
    isAuthenticated: !!token,
    login,
    logout,
    refresh,
    refreshUserInfo,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};