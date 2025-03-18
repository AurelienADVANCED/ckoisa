import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getPlayerByPseudo, addFriend, getToken, getMyFriends, getUserIdFromToken } from '@/src/services/api';
import { FriendRelation } from '@/src/types/FriendRelation';
import { UserInfo } from '@/src/types/UserInfo';

export default function AddFriendsScreen() {
  const insets = useSafeAreaInsets();
  const [searchText, setSearchText] = useState<string>('');
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [friends, setFriends] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Charger la liste des amis et l'ID utilisateur actuel
  useEffect(() => {
    const fetchFriendsAndUser = async () => {
      try {
        const token = await getToken();
        if (!token) throw new Error("Token utilisateur introuvable");

        const friendRelations: FriendRelation[] = await getMyFriends(token);
        const friendIds = friendRelations.map(friend => friend.friendId);
        setFriends(friendIds);

        const userId = await getUserIdFromToken(token);
        setCurrentUserId(userId);
      } catch (error) {
        console.error("Erreur lors de la récupération des amis et de l'ID utilisateur :", error);
      }
    };

    fetchFriendsAndUser();
  }, []);

  // Fonction pour rechercher un joueur par pseudo
  const handleSearch = async () => {
    if (!searchText.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un pseudo pour rechercher un joueur.");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      if (!token) throw new Error("Token utilisateur introuvable");

      const fetchedUsers = await getPlayerByPseudo(token, searchText);
      setUsers(Array.isArray(fetchedUsers) ? fetchedUsers : [fetchedUsers]);
    } catch (error) {
      console.error("Erreur lors de la recherche :", error);
      Alert.alert("Erreur", "Aucun joueur trouvé.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour ajouter un ami
  const handleAddFriend = async (user: UserInfo) => {
    try {
      const token = await getToken();
      if (!token) throw new Error("Token utilisateur introuvable");

      await addFriend(token, user.id);
      Alert.alert("Succès", `${user.pseudo} a été ajouté à votre liste d'amis !`);

      // Mettre à jour la liste des amis pour désactiver le bouton
      setFriends([...friends, user.id]);
    } catch (error) {
      console.error("Erreur lors de l'ajout d'ami :", error);
      Alert.alert("Erreur", "Impossible d'ajouter cet utilisateur.");
    }
  };

  // Vérifie si l'utilisateur est déjà un ami
  const isAlreadyFriend = (userId: string) => friends.includes(userId);

  // Affichage de chaque utilisateur dans la liste
  const renderItem = ({ item }: { item: UserInfo }) => {
    const alreadyFriend = isAlreadyFriend(item.id);
    const isCurrentUser = item.id === currentUserId;

    return (
      <View style={styles.userItem}>
        <Image style={styles.avatar} source={{ uri: item.avatar }} />
        <Text style={styles.userName}>{item.pseudo}</Text>
        <TouchableOpacity
          style={[styles.addButton, (alreadyFriend || isCurrentUser) && styles.disabledButton]}
          onPress={() => !alreadyFriend && !isCurrentUser && handleAddFriend(item)}
          disabled={alreadyFriend || isCurrentUser}
        >
          {isCurrentUser ? (
            <Text style={styles.addButtonText}>Vous</Text>
          ) : alreadyFriend ? (
            <Text style={styles.addButtonText}>Ajouté</Text>
          ) : (
            <>
              <Ionicons name="add-circle" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Ajouter</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Ajouter des amis</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Entrez un pseudo..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#e91e63" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderColor: '#e91e63',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#e91e63',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 10,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    color: '#000',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#e91e63',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#aaa',
  },
});
