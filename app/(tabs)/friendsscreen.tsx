// FriendsScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

interface Friend {
  id: string;
  name: string;
  status: 'online' | 'offline';
  photo: string;
}

export default function FriendsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', name: 'Alice', status: 'online', photo: 'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg' },
    { id: '2', name: 'Bob', status: 'offline', photo: 'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg' },
    { id: '3', name: 'Charlie', status: 'online', photo: 'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg' },
    { id: '4', name: 'David', status: 'offline', photo: 'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg' },
  ]);

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'online' | 'offline'>('all');

  const addFriend = () => {
    router.push({
      pathname: '/addfriendscreen',
    });
  };

  const sendChallenge = (friend: Friend) => {
    router.push({
      pathname: '/challengescreen',
      params: {
        friendId: friend.id,
        friendName: friend.name,
        friendPhoto: friend.photo,
        username: 'JohnDoe',
        userPhoto: 'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg', 
      },
    });
  };

  const filterFriends = (filter: 'all' | 'online' | 'offline'): Friend[] => {
    switch (filter) {
      case 'online':
        return friends.filter(friend => friend.status === 'online');
      case 'offline':
        return friends.filter(friend => friend.status === 'offline');
      default:
        return friends;
    }
  };

  const renderItem = ({ item }: { item: Friend }) => (
    <View style={styles.friendItem}>
      <Image style={styles.avatar} source={{ uri: item.photo }} />
      <View style={styles.infoContainer}>
        <Text style={styles.friendName}>{item.name}</Text>
        <View style={styles.friendStatus}>
          <Ionicons
            name={item.status === 'online' ? 'person' : 'person-outline'}
            size={16}
            color={item.status === 'online' ? 'green' : 'gray'}
          />
          <Text style={styles.statusText}>
            {item.status === 'online' ? 'En ligne' : 'Hors ligne'}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => sendChallenge(item)} style={styles.sendChallengeButton}>
        <Text style={styles.sendChallengeButtonText}>Défier</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'all' && styles.selectedFilterButton]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={styles.filterButtonText}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'online' && styles.selectedFilterButton]}
          onPress={() => setSelectedFilter('online')}
        >
          <Text style={styles.filterButtonText}>En ligne</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'offline' && styles.selectedFilterButton]}
          onPress={() => setSelectedFilter('offline')}
        >
          <Text style={styles.filterButtonText}>Hors ligne</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={filterFriends(selectedFilter)}
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
    paddingTop: 20,
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
    width: '100%',
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