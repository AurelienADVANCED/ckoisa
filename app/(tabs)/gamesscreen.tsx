import React, { useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, SafeAreaView, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../src/contexts/AuthContext';
import { getMyGames } from '@/src/services/api';

export default function NotifScreen() {
  const { token, isAuthenticated, logout, userInfo } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const router = useRouter();

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

  if (isAuthenticated && !userInfo) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <Text>Chargement des informations...</Text>
      </SafeAreaView>
    );
  }

  const gamesData = getMyGames(token);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      
      

      <FlatList
        data={gamesData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.friendList}
        contentContainerStyle={styles.friendListContent}
      />


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginVertical: 20,
  },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  placeholderText: {
    color: '#fff',
    fontSize: 16,
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
    width: '100%',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
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
    width: '100%',
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
});
