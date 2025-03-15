import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { registerUser } from '../src/services/api'; 
import { AuthContext } from '../src/contexts/AuthContext';

export default function RegisterScreen() {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>(''); 
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useContext(AuthContext);

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      // Créer l'utilisateur via l'API
      await registerUser(username, password, email);

      // Se connecter automatiquement après l'inscription
      await login(username, password);
      Alert.alert('Succès', 'Utilisateur créé et connecté avec succès.');
      router.push('/profilescreen');
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Échec de l\'inscription');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Créer un compte</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nom d'utilisateur"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <Text style={styles.registerButtonText}>S'inscrire</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginLink} onPress={() => router.push('/loginscreen')}>
        <Text style={styles.loginLinkText}>Vous avez déjà un compte ? Connectez-vous</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e91e63',
    marginBottom: 40,
  },
  inputContainer: {
    width: '100%',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#e91e63',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#e91e63',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginTop: 10,
  },
  loginLinkText: {
    color: '#e91e63',
    fontSize: 16,
  },
});