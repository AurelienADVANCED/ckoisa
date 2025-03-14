import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isProfilePublic, setIsProfilePublic] = useState<boolean>(true);
  const [isFriendsVisible, setIsFriendsVisible] = useState<boolean>(true);
  const [isChallengesVisible, setIsChallengesVisible] = useState<boolean>(true);

  const toggleProfilePublic = () => {
    setIsProfilePublic(prevState => !prevState);
  };

  const toggleFriendsVisible = () => {
    setIsFriendsVisible(prevState => !prevState);
  };

  const toggleChallengesVisible = () => {
    setIsChallengesVisible(prevState => !prevState);
  };

  const saveSettings = () => {
    router.push({
      pathname: '/loginscreen'
    });
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Paramètres de confidentialité</Text>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Profil public</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isProfilePublic ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleProfilePublic}
          value={isProfilePublic}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Amis visibles</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isFriendsVisible ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleFriendsVisible}
          value={isFriendsVisible}
        />
      </View>
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>Défis visibles</Text>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isChallengesVisible ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleChallengesVisible}
          value={isChallengesVisible}
        />
      </View>
      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.saveButtonText}>Enregistrer les paramètres</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  settingLabel: {
    fontSize: 18,
    color: '#000',
  },
  saveButton: {
    marginTop: 30,
    backgroundColor: '#e91e63',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    width: '100%',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});