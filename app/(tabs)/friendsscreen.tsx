import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

interface Friend {
  id: string;
  name: string;
  status: 'online' | 'offline';
}

export default function FriendsScreen() {
  const insets = useSafeAreaInsets();

  const [friends, setFriends] = useState<Friend[]>([
    { id: '1', name: 'Alice', status: 'online' },
    { id: '2', name: 'Bob', status: 'offline' },
    { id: '3', name: 'Charlie', status: 'online' },
    { id: '4', name: 'David', status: 'offline' },
  ]);

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [selectedMode, setSelectedMode] = useState<'progressive' | 'decoupe'>('progressive');
  const [steps, setSteps] = useState<number>(3);

  const addFriend = () => {
    Alert.alert('Ajouter un ami', 'Vous pouvez ajouter un ami ici', [
      { text: 'OK' }
    ]);
  };

  const sendChallenge = (friend: Friend) => {
    Alert.alert('Défi envoyé', `Défi envoyé à ${friend.name}`, [
      { text: 'OK' }
    ]);
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
      <Text style={styles.friendName}>{item.name}</Text>
      <View style={styles.friendStatus}>
        <Ionicons
          name={item.status === 'online' ? 'ios-person' : 'ios-person-outline'}
          size={16}
          color={item.status === 'online' ? 'green' : 'gray'}
        />
        <Text style={styles.statusText}>
          {item.status === 'online' ? 'En ligne' : 'Hors ligne'}
        </Text>
      </View>
      <TouchableOpacity onPress={() => sendChallenge(item)} style={styles.sendChallengeButton}>
        <Text style={styles.sendChallengeButtonText}>Défier</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.addButton} onPress={addFriend}>
        <Ionicons name="ios-add" size={24} color="#fff" />
      </TouchableOpacity>
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
  gameModeSection: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
  },
  gameModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  gameModeButton: {
    backgroundColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    width: '45%',
    alignItems: 'center',
  },
  selectedModeButton: {
    backgroundColor: '#e91e63',
  },
  gameModeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  stepsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  picker: {
    width: 120,
    height: 50,
  },
});
