import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../src/contexts/AuthContext';

export default function ProfileScreen() {
  const { token, isAuthenticated, logout, userInfo } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Text style={styles.notConnectedText}>
          Vous devez être connecté pour accéder à votre profil.
        </Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/loginscreen')}>
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (isAuthenticated && !userInfo) {
    return (
      <SafeAreaView style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <Text style={styles.loadingText}>Chargement des informations...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {userInfo.avatar ? (
        <Image source={{ uri: userInfo.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.placeholderAvatar}>
          <Text style={styles.placeholderText}>Avatar</Text>
        </View>
      )}
      <Text style={styles.username}>{userInfo.pseudo}</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userInfo.defisEnvoyes}</Text>
          <Text style={styles.statLabel}>Défis envoyés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userInfo.defisGagnes}</Text>
          <Text style={styles.statLabel}>Défis gagnés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userInfo.defisPerdus}</Text>
          <Text style={styles.statLabel}>Défis perdus</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userInfo.points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
      </View>
      <View style={styles.settingsContainer}>
        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settingsscreen')}>
          <Text style={styles.settingsButtonText}>Paramètres de confidentialité</Text>
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
    paddingHorizontal: 20,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  notConnectedText: {
    fontSize: 20,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 20,
    color: '#e91e63',
    textAlign: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginVertical: 20,
  },
  placeholderAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 18,
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center', // Centrage du pseudo
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#e91e63',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  settingsContainer: {
    width: '100%',
    marginTop: 30,
  },
  settingsButton: {
    padding: 12,
    backgroundColor: '#e91e63',
    borderRadius: 8,
    marginBottom: 15,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});