// src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { loginUser, refreshToken, getPlayerInfo } from '../services/api';
import Constants from 'expo-constants';
import { jwtDecode } from 'jwt-decode';
import { apiFetch } from '../services/apiClient';
import { UserInfo } from '../types/UserInfo';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://192.168.1.20:8080';
const API_BASE_URL_API = Constants.expoConfig?.extra?.API_BASE_URL_API || 'http://192.168.1.21:8082';

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
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  userId: null,
  userInfo: null,
  isAuthenticated: false,
  login: async () => { },
  logout: async () => { },
  refresh: async () => { },
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

  // Fonction de connexion : appelle Keycloak (ou votre serveur) et sauvegarde le token
  const login = async (username: string, password: string) => {
    try {
      // 1) Appel à Keycloak ou votre backend pour récupérer tokenData
      const tokenData = await loginUser(username, password);

      // 2) Stocker le access_token
      setToken(tokenData.access_token);
      await SecureStore.setItemAsync('userToken', tokenData.access_token);

      // 3) Stocker le refresh_token
      await SecureStore.setItemAsync('userRefreshToken', tokenData.refresh_token, {
        keychainAccessible: SecureStore.ALWAYS,
      });

      // 4) Extraire sub (UUID) et l’enregistrer
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
