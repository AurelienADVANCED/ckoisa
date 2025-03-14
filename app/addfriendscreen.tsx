import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, SafeAreaView, Image, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface User {
  id: string;
  name: string;
  photo: string;
}

export default function AddFriendsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Liste simulée d'utilisateurs disponibles
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Alice', photo: 'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg' },
    { id: '2', name: 'Bob', photo: 'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg' },
    { id: '3', name: 'Charlie', photo: 'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg' },
    { id: '4', name: 'David', photo: 'https://images.squarespace-cdn.com/content/v1/607f89e638219e13eee71b1e/1684821560422-SD5V37BAG28BURTLIXUQ/michael-sum-LEpfefQf4rU-unsplash.jpg' },
  ]);

  const [searchText, setSearchText] = useState<string>('');

  // Filtrer la liste des utilisateurs en fonction du texte de recherche
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const addFriend = (user: User) => {
    // Ici, vous pouvez appeler votre API pour ajouter un ami
    Alert.alert('Ami ajouté', `${user.name} a été ajouté à vos amis !`);
  };

  const renderItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      <Image style={styles.avatar} source={{ uri: item.photo }} />
      <Text style={styles.userName}>{item.name}</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => addFriend(item)}>
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Ajouter</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Ajouter des amis</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Rechercher un utilisateur"
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 20,
    textAlign: 'center',
  },
  searchInput: {
    height: 50,
    borderColor: '#e91e63',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
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
});