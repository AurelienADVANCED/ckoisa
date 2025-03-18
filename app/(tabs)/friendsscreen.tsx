// FriendsScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  SafeAreaView, 
  Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { getMyFriends } from '@/src/services/api';
import { AuthContext } from '../../src/contexts/AuthContext';

interface Friend {
  id: string;
  name: string;
  photo: string;
}

export default function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'online' | 'offline'>('all');

  useEffect(() => {
    const fetchFriends = async () => {
      if (!token) {
        console.error("Token non défini");
        return;
      }
      try {
        const friendsData = await getMyFriends(token);
        console.log(friendsData);
        
        const uiFriends: Friend[] = friendsData.map((f: any) => ({
          id: f.id.toString(),      
          name: f.pseudo,
          photo: f.avatar, 
        }));
        setFriends(uiFriends);
      } catch (error) {
        console.error('Erreur lors de la récupération des amis :', error);
      }
    };
  
    fetchFriends();
  }, [token]);

  // Navigation pour ajouter un ami
  const addFriend = () => {
    router.push({
      pathname: '/addfriendscreen',
    });
  };

  // Navigation pour envoyer un défi
  const sendChallenge = (friend: Friend) => {
    router.push({
      pathname: '/challengescreen',
      params: {
        friendId: friend.id,
        friendName: friend.name,
        friendPhoto: friend.photo,
      },
    });
  };

  // Rendu d'un item dans la FlatList
  const renderItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <Image style={styles.avatar} source={{ uri: item.photo }} />
      <View style={styles.infoContainer}>
        <Text style={styles.friendName}>{item.name}</Text>
      </View>
      <TouchableOpacity onPress={() => sendChallenge(item)} style={styles.sendChallengeButton}>
        <Text style={styles.sendChallengeButtonText}>Défier</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        style={styles.friendList}
        contentContainerStyle={styles.friendListContent}
      />
      <TouchableOpacity style={styles.addButton} onPress={addFriend}>
        <Ionicons name="add" size={24} color="#fff" />
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
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#e91e63',
    borderRadius: 25,
    padding: 15,
    elevation: 5,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: '30%',
    alignItems: 'center',
  },
  selectedFilterButton: {
    backgroundColor: '#e91e63',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
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
    color: '#000',
  },
  friendStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
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
  friendList: {
    flex: 1,
  },
  friendListContent: {
    flexGrow: 1,
  },
});
