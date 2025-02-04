import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router'; 

export default function ChallengeScreen() {
  const [selectedGameMode, setSelectedGameMode] = useState<'floutee' | 'cachee'>('floutee');
  const [selectedSteps, setSelectedSteps] = useState<number>(1);
  const insets = useSafeAreaInsets();
  const { friendName, username } = useLocalSearchParams();

  const gamemodes = [
    { label: 'Floutée', value: 'floutee' },
    { label: 'Cachée', value: 'cachee' },
  ];

  const handleSendChallenge = () => {
    Alert.alert(
      'Défi envoyé',
      `Défi envoyé à: ${friendName}\nMode de jeu: ${selectedGameMode.charAt(0).toUpperCase() + selectedGameMode.slice(1)}\nÉtapes: ${selectedSteps}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Défi pour {friendName}</Text>
      <Text style={styles.username}>Par {username}</Text>
      <Text style={styles.title}>Choisir le mode de jeu</Text>
      <View style={styles.gameModeContainer}>
        {gamemodes.map(mode => (
          <TouchableOpacity
            key={mode.value}
            style={[
              styles.gameModeButton,
              selectedGameMode === mode.value && styles.selectedModeButton,
            ]}
            onPress={() => setSelectedGameMode(mode.value)}
          >
            <Text style={styles.gameModeButtonText}>{mode.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.title}>Choisir le nombre d'étapes</Text>
      <Picker
        selectedValue={selectedSteps}
        onValueChange={(itemValue) => setSelectedSteps(itemValue)}
        style={styles.picker}
        itemStyle={styles.pickerItem}
      >
        {Array.from({ length: 8 }, (_, i) => i + 1).map(step => (
          <Picker.Item key={step} label={`${step}`} value={step} />
        ))}
      </Picker>
      <TouchableOpacity style={styles.sendChallengeButton} onPress={handleSendChallenge}>
        <Text style={styles.sendChallengeButtonText}>Envoyer le défi</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  username: {
    fontSize: 20,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  gameModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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
  picker: {
    width: '100%',
    height: 50,
    marginBottom: 20,
  },
  pickerItem: {
    color: '#000',
  },
  sendChallengeButton: {
    backgroundColor: '#e91e63',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  sendChallengeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});