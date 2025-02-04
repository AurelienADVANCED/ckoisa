import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';

export default function Game() {
  const insets = useSafeAreaInsets();

  // États pour stocker le mode sélectionné et le nombre d'étapes
  const [selectedMode, setSelectedMode] = useState('blurred');
  const [steps, setSteps] = useState(3);

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.gameModeSection}>
        <View style={styles.gameModeContainer}>
          <TouchableOpacity
            style={[styles.gameModeButton, selectedMode === 'blurred' && styles.selectedModeButton]}
            onPress={() => setSelectedMode('blurred')}
          >
            <Text style={styles.gameModeButtonText}>Floutée</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gameModeButton, selectedMode === 'hidden' && styles.selectedModeButton]}
            onPress={() => setSelectedMode('hidden')}
          >
            <Text style={styles.gameModeButtonText}>Cachée</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.stepsContainer}>
          <Text style={styles.stepsLabel}>Nombre d'étapes:</Text>
          <Picker
            selectedValue={steps}
            onValueChange={(itemValue) => setSteps(Number(itemValue))}
            mode={Platform.OS === 'ios' ? 'dropdown' : 'dialog'}
            style={styles.picker}
          >
            <Picker.Item label="3" value={3} />
            <Picker.Item label="4" value={4} />
            <Picker.Item label="5" value={5} />
            <Picker.Item label="6" value={6} />
          </Picker>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0'
  },
  gameModeSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  gameModeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  gameModeButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  selectedModeButton: {
    backgroundColor: '#0056b3', // Couleur plus foncée pour montrer la sélection
  },
  gameModeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepsContainer: {
    alignItems: 'center',
  },
  stepsLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  picker: {
    width: 150,
    height: 40,
  }
});
