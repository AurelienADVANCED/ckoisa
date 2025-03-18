import React, { useEffect, useState, useContext, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert 
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { AuthContext } from '../../src/contexts/AuthContext';
import { getMyGames, deleteGame } from '@/src/services/api';

interface Game {
  id: number;
  playerId: string;
  playerIdTarget: string;
  status: string;
  urlImage: string;
  gameMode: string;
  etape: number;
}

export default function GamesListScreen() {
  const { token, isAuthenticated } = useContext(AuthContext);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const fetchGames = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const myGames = await getMyGames(token);
      console.log("Données reçues de l'API :", myGames);
      if (Array.isArray(myGames)) {
        setGames(myGames);
      } else {
        console.error("Erreur : getMyGames ne retourne pas un tableau !");
        setGames([]);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des jeux :", error);
      Alert.alert("Erreur", "Impossible de récupérer vos jeux.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchGames();
    }, [token])
  );

  // Handler pour "lancer" le jeu : supprime le jeu de la BDD, puis navigue vers /gamescreen
  const handleLaunchGame = async (game: Game) => {
    try {
      await deleteGame(token!, game.id);
      Alert.alert("Succès", "Le jeu a été lancé.");
      setGames(prev => prev.filter(g => g.id !== game.id));
      router.push({
        pathname: '/gamescreen',
        params: {
          gameId: game.id.toString(),
          challengeImage: game.urlImage,
          gameMode: game.gameMode,
          totalSteps: game.etape.toString(),
          status: game.status,
        },
      });
    } catch (error: any) {
      console.error("Erreur lors du lancement du jeu :", error);
      Alert.alert("Erreur", error.message || "Une erreur est survenue lors du lancement du jeu.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#e91e63" />
      </SafeAreaView>
    );
  }

  // Si le token n'est pas défini, l'utilisateur n'est pas connecté
  if (!token) {
    return (
      <SafeAreaView style={[styles.container, styles.notConnectedContainer, { paddingTop: insets.top }]}>
        <Text style={styles.notConnectedText}>Vous n'êtes pas connecté. Veuillez vous connecter.</Text>
        <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/loginscreen')}>
          <Text style={styles.loginButtonText}>Se connecter</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Mes Jeux</Text>
      {games.length === 0 ? (
        <Text style={styles.noGamesText}>Aucun jeu trouvé.</Text>
      ) : (
        <View style={styles.tableContainer}>
          {/* En-tête du tableau */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { flex: 2 }]}>Mode</Text>
            <Text style={[styles.headerText, { flex: 2 }]}>Statut</Text>
            <Text style={[styles.headerText, { flex: 1 }]}>Étape</Text>
            <Text style={[styles.headerText, { flex: 1 }]}>Action</Text>
          </View>
          <FlatList
            data={games}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.rowText, { flex: 2 }]}>{item.gameMode}</Text>
                <Text style={[styles.rowText, { flex: 2 }]}>{item.status}</Text>
                <Text style={[styles.rowText, { flex: 1 }]}>{item.etape}</Text>
                <TouchableOpacity 
                  style={styles.launchButton} 
                  onPress={() => handleLaunchGame(item)}
                >
                  <Text style={styles.launchButtonText}>Lancer</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.listContainer}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const API_BASE_URL_API = 'http://192.168.144.61:8082';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Fond gris clair
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  notConnectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notConnectedText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#e91e63',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 20,
    textAlign: 'center',
  },
  noGamesText: {
    fontSize: 18,
    color: '#333', // Texte sombre
    marginTop: 20,
    textAlign: 'center',
  },
  tableContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e91e63',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    alignItems: 'center',
  },
  rowText: {
    color: '#333',
    fontSize: 16,
    textAlign: 'center',
  },
  launchButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: 5,
  },
  launchButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
});