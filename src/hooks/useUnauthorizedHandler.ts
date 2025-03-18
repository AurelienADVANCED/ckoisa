// src/hooks/useUnauthorizedHandler.ts
import { useEffect, useContext } from 'react';
import { useRouter } from 'expo-router';
import { AuthContext } from '../contexts/AuthContext';
import { setUnauthorizedCallback } from '../services/apiClient';

export function useUnauthorizedHandler() {
  const router = useRouter();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    setUnauthorizedCallback(() => {
      logout();
      router.push('/loginscreen'); 
    });
  }, []);
}