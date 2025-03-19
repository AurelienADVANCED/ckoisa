import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import Constants from 'expo-constants';
import { AuthContext } from '../src/contexts/AuthContext';
import { updatePlayerStats } from '@/src/services/api';
import { LocalSearchParams } from '@/src/types/LocalSearchParams';

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const localParams = useLocalSearchParams() as unknown as LocalSearchParams;
  const { gameMode, totalSteps, challengeImage, correctAnswer } = localParams;
  const router = useRouter();

  const stepsCount = parseInt(totalSteps) || 3;
  const maxMistakes = 3;

  // États du jeu
  const [statsUpdated, setStatsUpdated] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [guess, setGuess] = useState<string>('');
  const [mistakeCount, setMistakeCount] = useState<number>(0);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [hasLost, setHasLost] = useState<boolean>(false);
  const [loseReason, setLoseReason] = useState<string>('');

  // Image et réponse par défaut
  const imageUrl = challengeImage || 'https://via.placeholder.com/300';
  const answer = correctAnswer || 'objet';

  // Calcul du flou pour le mode "floutee" (plus violent)
  const initialBlur = 40;
  const blurRadius = gameMode === 'floutee' ? (initialBlur * (stepsCount - currentStep)) / stepsCount : 0;

  // Calcul des segments masqués pour le mode "cachee"
  const imageWidth = Dimensions.get('window').width - 40;
  const imageHeight = imageWidth;
  const maskSegments = [];
  for (let i = currentStep + 1; i < stepsCount; i++) {
    maskSegments.push(i);
  }

  // États du context
  const { token, userInfo, refreshUserInfo } = useContext(AuthContext);

  // Passe à l'étape suivante
  const handleNextStep = () => {
    if (currentStep < stepsCount - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setHasLost(true);
      setLoseReason('imageRevealed');
    }
  };

  // Vérifie la réponse saisie
  const handleSubmitGuess = () => {
    if (guess.trim().toLowerCase() === answer.toLowerCase()) {
      setHasWon(true);
    } else {
      const newMistakes = mistakeCount + 1;
      setMistakeCount(newMistakes);
      if (newMistakes >= maxMistakes) {
        setHasLost(true);
        setLoseReason('tooManyMistakes');
      } else {
        Alert.alert("Réponse incorrecte", `Il vous reste ${maxMistakes - newMistakes} erreur(s) possibles.`);
      }
    }
  };

  // Exemple dans votre useEffect de GameScreen
  useEffect(() => {
    if ((hasWon || hasLost) && token && userInfo && !statsUpdated) {
      const updateStats = async () => {
        try {
          const updatedPlayerInfo = { ...userInfo, defisEnvoyes: userInfo.defisEnvoyes + 1 };
          if (hasWon) {
            updatedPlayerInfo.defisGagnes = userInfo.defisGagnes + 1;
            updatedPlayerInfo.points = userInfo.points + 100;
          } else {
            updatedPlayerInfo.defisPerdus = userInfo.defisPerdus + 1;
            updatedPlayerInfo.points = userInfo.points - 100;
          }
          await updatePlayerStats(token, updatedPlayerInfo);
          // Rafraîchir le context après la mise à jour
          await refreshUserInfo();
          setStatsUpdated(true);
        } catch (err) {
        }
      };
      updateStats();
    }
  }, [hasWon, hasLost, token, userInfo, statsUpdated, refreshUserInfo]);


  // Vue de victoire
  if (hasWon) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.endGameContainer}>
          <Text style={styles.endGameTitle}>Gagnée!</Text>
          <Text style={styles.endGameText}>
            Vous avez trouvé la bonne réponse en {currentStep} étape(s) avec {mistakeCount} erreur(s).
          </Text>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/')}>
            <Text style={styles.homeButtonText}>Retour à l'écran d'accueil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Vue de défaite
  if (hasLost) {
    let loseMessage = '';
    if (loseReason === 'tooManyMistakes') {
      loseMessage = "Vous avez fait trop de fautes !";
    } else if (loseReason === 'imageRevealed') {
      loseMessage = `L'image a été révélée, l'objet était : ${answer}`;
    }
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.endGameContainer}>
          <Text style={styles.endGameTitle}>Perdu!</Text>
          <Text style={styles.endGameText}>
            {loseMessage} (Étapes utilisées : {currentStep}, Erreurs : {mistakeCount})
          </Text>
          <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/')}>
            <Text style={styles.homeButtonText}>Retour à l'écran d'accueil</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Devinez l'objet</Text>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={[styles.challengeImage, { width: imageWidth, height: imageHeight }]}
            blurRadius={gameMode === 'floutee' ? blurRadius : 0}
          />
          {gameMode === 'cachee' &&
            maskSegments.map((segment, index) => {
              const segmentHeight = imageHeight / stepsCount;
              return (
                <View
                  key={index}
                  style={{
                    position: 'absolute',
                    top: segment * segmentHeight,
                    left: 0,
                    width: imageWidth,
                    height: segmentHeight,
                    backgroundColor: 'white',
                  }}
                />
              );
            })}
        </View>
        <Text style={styles.stepCounter}>Étapes restantes : {stepsCount - currentStep}</Text>
        <Text style={styles.mistakeCounter}>Erreurs restantes : {maxMistakes - mistakeCount}</Text>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.nextStepButton} onPress={handleNextStep}>
            <Text style={styles.nextStepButtonText}>Étape suivante</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.guessInput}
            placeholder="Votre réponse..."
            value={guess}
            onChangeText={setGuess}
          />
          <TouchableOpacity style={styles.submitGuessButton} onPress={handleSubmitGuess}>
            <Text style={styles.submitGuessButtonText}>Valider</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center'
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20,
    alignItems: 'center'
  },
  challengeImage: {
    borderRadius: 10
  },
  stepCounter: {
    fontSize: 18,
    marginBottom: 5,
    color: '#333',
    textAlign: 'center'
  },
  mistakeCounter: {
    fontSize: 18,
    marginBottom: 20,
    color: '#d32f2f',
    textAlign: 'center'
  },
  controls: {
    width: '100%',
    alignItems: 'center'
  },
  nextStepButton: {
    backgroundColor: '#e91e63',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center'
  },
  nextStepButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  guessInput: {
    width: '80%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    alignSelf: 'center'
  },
  submitGuessButton: {
    backgroundColor: '#4caf50',
    padding: 15,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center'
  },
  submitGuessButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  endGameContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
  endGameTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20
  },
  endGameText: {
    fontSize: 20,
    color: '#333',
    marginBottom: 40,
    textAlign: 'center'
  },
  homeButton: {
    backgroundColor: '#e91e63',
    padding: 15,
    borderRadius: 10
  },
  homeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
});