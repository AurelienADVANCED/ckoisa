import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getScoreboard } from '@/src/services/api';

interface Player {
  id: string;
  name: string;
  score: number;
  photo: string;
}

export default function ScoreboardScreen() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const fetchScoreboard = async () => {
    try {
      const data = await getScoreboard();
      const mappedPlayers: Player[] = data.map((p: any) => ({
        id: p.id.toString(),
        name: p.pseudo,
        score: p.points,
        photo: p.avatar,
      }));
      // Tri par score décroissant
      mappedPlayers.sort((a, b) => b.score - a.score);
      setPlayers(mappedPlayers);
    } catch (error: any) {
      console.error("Erreur lors de la récupération du scoreboard:", error);
      Alert.alert("Erreur", "Impossible de récupérer le scoreboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScoreboard();
  }, []);

  const goBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#e91e63" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Classement</Text>
      </View>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.playerItem}>
            <Image style={styles.avatar} source={{ uri: item.photo }} />
            <Text style={styles.playerName}>{item.name}</Text>
            <Text style={styles.playerScore}>{item.score} pts</Text>
          </View>
        )}
        style={styles.playerList}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  backButton: {
    paddingRight: 15,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    width: '100%',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  playerName: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
  playerScore: {
    fontSize: 18,
    color: '#666',
  },
  playerList: {
    flex: 1,
    width: '100%',
  },
});