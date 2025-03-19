import React, { useEffect, useCallback } from 'react';
import { Alert, BackHandler } from 'react-native';
import { useSegments, useRouter } from 'expo-router';

export function AppExitHandler() {
  const segments = useSegments();

  const onBackPress = useCallback(() => {
    if (segments.length <= 1) {
      Alert.alert(
        'Quitter l\'application',
        'Voulez-vous vraiment quitter l\'application ?',
        [
          { text: 'Annuler', style: 'cancel', onPress: () => {} },
          { text: 'Oui', style: 'destructive', onPress: () => BackHandler.exitApp() },
        ]
      );
      return true; 
    }
  }, [segments]);

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    };
  }, [onBackPress]);

  return null;
}