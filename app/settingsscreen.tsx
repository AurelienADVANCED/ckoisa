import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  TouchableOpacity, 
  SafeAreaView 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AuthContext } from '../src/contexts/AuthContext';
import { getMySettings, updateMySettings } from '@/src/services/api';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [settings, setSettings] = useState({
    profilPublic: true,
    amisVisibles: true,
    defisVisibles: true,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Récupération des settings via l'API
  useEffect(() => {
    const fetchSettings = async () => {
      if (!token) {
        setError("Vous devez être connecté pour récupérer vos paramètres.");
        setLoading(false);
        return;
      }
      try {
        const data = await getMySettings(token);
        // On suppose que l'API renvoie un tableau et qu'un seul settings est associé à l'utilisateur
        if (data && data.length > 0) {
          const s = data[0];
          setSettings({
            profilPublic: s.profilPublic,
            amisVisibles: s.amisVisibles,
            defisVisibles: s.defisVisibles,
          });
        }
      } catch (err: any) {
        setError("Impossible de récupérer vos paramètres.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [token]);

  // Fonctions de basculement pour chaque switch
  const toggleProfilePublic = () => {
    setSettings(prev => ({ ...prev, profilPublic: !prev.profilPublic }));
  };

  const toggleFriendsVisible = () => {
    setSettings(prev => ({ ...prev, amisVisibles: !prev.amisVisibles }));
  };

  const toggleChallengesVisible = () => {
    setSettings(prev => ({ ...prev, defisVisibles: !prev.defisVisibles }));
  };

  // Fonction pour sauvegarder les paramètres via l'API
  const saveSettings = async () => {
    if (!token) return;
    try {
      const updatedSettings = await updateMySettings(token, settings);
      // On peut mettre à jour l'état avec la réponse si besoin
      setSettings({
        profilPublic: updatedSettings.profilPublic,
        amisVisibles: updatedSettings.amisVisibles,
        defisVisibles: updatedSettings.defisVisibles,
      });
      // On peut rediriger ou afficher un message de succès (ici on affiche simplement dans l'UI)
      setError("Paramètres enregistrés avec succès.");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour des paramètres.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Paramètres de confidentialité</Text>
      {error !== '' && (
        <Text style={styles.errorText}>{error}</Text>
      )}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Profil public</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={settings.profilPublic ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleProfilePublic}
          value={settings.profilPublic}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Amis visibles</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={settings.amisVisibles ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleFriendsVisible}
          value={settings.amisVisibles}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Défis visibles</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={settings.defisVisibles ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleChallengesVisible}
          value={settings.defisVisibles}
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>Enregistrer les paramètres</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingLabel: {
    fontSize: 18,
    color: '#000',
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#e91e63',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 20,
    color: '#e91e63',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 15,
  },
});