import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getToken } from '../../src/services/api'; 

export default function ProfileScreen() {
  const [username, setUsername] = useState<string>('JohnDoe');
  const [challengesSent, setChallengesSent] = useState<number>(10); 
  const [successRate, setSuccessRate] = useState<number>(85); 
  const [points, setPoints] = useState<number>(250); 
  const [rank, setRank] = useState<number>(3); 

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleShowToken = async () => {
    try {
      const token = await getToken();
      Alert.alert('Votre Token', token || 'Aucun token trouvé');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de récupérer le token');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.username}>{username}</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{challengesSent}</Text>
          <Text style={styles.statLabel}>Défis envoyés</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{successRate}%</Text>
          <Text style={styles.statLabel}>Taux de réussite</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{points}</Text>
          <Text style={styles.statLabel}>Points</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>#{rank}</Text>
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
        <TouchableOpacity style={styles.tokenButton} onPress={handleShowToken}>
          <Text style={styles.tokenButtonText}>Afficher mon token</Text>
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
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
    marginTop: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#e91e63',
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