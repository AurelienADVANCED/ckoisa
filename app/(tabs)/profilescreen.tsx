import React, { useContext, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { AuthContext } from '../../src/contexts/AuthContext';

export default function ProfileScreen() {
  const { token, isAuthenticated, logout } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Utiliser useFocusEffect pour déclencher un rafraîchissement ou une vérification si besoin
  useFocusEffect(
    useCallback(() => {
      console.log(isAuthenticated);
      return;
    }, [token])
  );

  // Si l'utilisateur n'est pas connecté ou que le token est invalide, afficher la vue "non connecté"
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.username}>Vous n'êtes pas connecté ou votre session a expiré.</Text>
        <View style={styles.settingsContainer}>
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/loginscreen')}>
            <Text style={styles.settingsButtonText}>Se connecter</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/register')}>
            <Text style={styles.settingsButtonText}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Affichage du profil si l'utilisateur est connecté
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.username}>JohnDoe</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>10</Text>
          <Text style={styles.statLabel}>Défis envoyés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>85%</Text>
          <Text style={styles.statLabel}>Taux de réussite</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>250</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>#3</Text>
          <Text style={styles.statLabel}>Classement</Text>
        </View>
      </View>
      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/editprofilescreen')}>
          <Text style={styles.settingsButtonText}>Modifier mon profil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settingsscreen')}>
          <Text style={styles.settingsButtonText}>Paramètres de confidentialité</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tokenButton} onPress={() => Alert.alert('Votre Token', token || 'Aucun token trouvé')}>
          <Text style={styles.tokenButtonText}>Afficher mon token</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingsButton} onPress={logout}>
          <Text style={styles.settingsButtonText}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '90%',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  settingsContainer: {
    width: '80%',
    marginTop: 30,
  },
  settingsButton: {
    padding: 10,
    backgroundColor: '#e91e63',
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tokenButton: {
    padding: 10,
    backgroundColor: '#4caf50',
    borderRadius: 5,
    marginBottom: 15,
    alignItems: 'center',
  },
  tokenButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
