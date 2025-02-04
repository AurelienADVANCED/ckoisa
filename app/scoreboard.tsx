import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface Player {
  id: string;
  name: string;
  score: number;
  photo: string;
}

export default function scoreboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State pour stocker les joueurs avec leurs scores
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Alice', score: 9500, photo: 'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg' },
    { id: '2', name: 'Bob', score: 7800, photo: 'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg' },
    { id: '3', name: 'Charlie', score: 8400, photo: 'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg' },
    { id: '4', name: 'David', score: 9200, photo: 'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg' },
  ]);

  // Trier les joueurs par score décroissant
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // Navigateur vers la page principale
  const goBack = () => {
    router.push('/');
  };

  // Rend le composant pour un élément de la liste (joueur)
  const renderItem = ({ item }: { item: Player }) => (
    <View style={styles.playerItem}>
      <Image style={styles.avatar} source={{ uri: item.photo }} />
      <Text style={styles.playerName}>{item.name}</Text>
      <Text style={styles.playerScore}>{item.score} pts</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Classement</Text>
      </View>
      <FlatList
        data={sortedPlayers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  playerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
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
  },
});