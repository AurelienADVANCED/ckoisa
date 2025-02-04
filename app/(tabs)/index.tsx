// index.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function App() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu Principal</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/game')}>
          <Text style={styles.buttonText}>Jouer</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => router.push('/scoreboard')}>
          <Text style={styles.buttonText}>Scoreboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f8ff', // Fond pastel pour une apparence moderne
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 10,
    width: '80%', // Largeur plus grande pour les boutons
    marginVertical: 10,
    elevation: 3, // Ombre pour Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});