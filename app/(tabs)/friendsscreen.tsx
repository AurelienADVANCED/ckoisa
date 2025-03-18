import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMyFriends } from '@/src/services/api';
import { AuthContext } from '../../src/contexts/AuthContext';
import { useRouter, useFocusEffect } from 'expo-router';

interface Friend {
  id: string;
  name: string;
  photo: string;
  uuid: string;
}

export default function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token } = useContext(AuthContext);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fonction pour récupérer les amis
  const fetchFriends = async () => {
    if (!token) {
      // Si pas de token, on ne fait rien, mais on passe à false pour arrêter l'indicateur de chargement.
      setLoading(false);
      return;
    }
    try {
      const friendsData = await getMyFriends(token);
      const uiFriends: Friend[] = friendsData.map((f: any) => ({
        id: f.id.toString(),
        name: f.pseudo,
        photo: f.avatar,
        uuid: f.friendId,
      }));
      setFriends(uiFriends);
    } catch (error) {
      console.error("Erreur lors de la récupération des amis :", error);
      Alert.alert("Erreur", "Impossible de récupérer vos amis.");
    } finally {
      setLoading(false);
    }
  };

  // useFocusEffect permet de recharger les données à chaque fois que l'écran devient actif.
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchFriends();
    }, [token])
  );

  // Rendu conditionnel selon si l'utilisateur est connecté ou non et si les données sont chargées
  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Si l'utilisateur n'est pas connecté */}
      {!token ? (
        <View style={styles.notConnectedContainer}>
          <Text style={styles.notConnectedText}>
            Vous n'êtes pas connecté. Veuillez vous connecter.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/loginscreen')}
          >
            <Text style={styles.loginButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.title}>Mes Amis</Text>
          <FlatList
            data={friends}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.friendItem}>
                <Image style={styles.avatar} source={{ uri: item.photo }} />
                <View style={styles.infoContainer}>
                  <Text style={styles.friendName}>{item.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/challengescreen',
                      params: {
                        friendId: item.id,
                        friendName: item.name,
                        friendPhoto: item.photo,
                        friendUUID: item.uuid,
                      },
                    })
                  }
                  style={styles.sendChallengeButton}
                >
                  <Text style={styles.sendChallengeButtonText}>Défier</Text>
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.friendListContent}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/addfriendscreen')}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#e91e63',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 20,
    textAlign: 'center',
  },
  friendItem: {
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
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sendChallengeButton: {
    backgroundColor: '#e91e63',
    borderRadius: 5,
    padding: 5,
    paddingHorizontal: 10,
  },
  sendChallengeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  friendListContent: {
    flexGrow: 1,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#e91e63',
    borderRadius: 25,
    padding: 15,
    elevation: 5,
  },
});