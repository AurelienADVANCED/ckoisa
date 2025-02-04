import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Button} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function App() {

  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Jouer</Text>
          <Button title="Jouer" onPress={() => router.push('/game')} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Scoreboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,               // occupe toute la hauteur de l'écran
    justifyContent: 'center', // centre verticalement
    alignItems: 'center',     // centre horizontalement
    backgroundColor: '#f0f0f0'
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,       // espace entre les boutons
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
