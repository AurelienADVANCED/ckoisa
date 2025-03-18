import React, { useState } from 'react';
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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import Constants from 'expo-constants';

export default function ChallengeScreen() {
    const [selectedGameMode, setSelectedGameMode] = useState<'floutee' | 'cachee'>('floutee');
    const [selectedSteps, setSelectedSteps] = useState<number>(1);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [objectToGuess, setObjectToGuess] = useState<string>('');
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const API_BASE_URL_SERVER = Constants.expoConfig?.extra?.API_BASE_URL_SERVER || 'http://192.168.144.61:3000';

    const gamemodes = [
        { label: 'Floutée', value: 'floutee' },
        { label: 'Cachée', value: 'cachee' },
    ];

    // Lance la caméra pour prendre une photo
    const takePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission refusée", "La permission d'utiliser l'appareil photo est nécessaire.");
            return null;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 1,
        });
        if (result.canceled) return null;
        return result.assets && result.assets.length > 0 ? result.assets[0].uri : null;
    };

    // Upload du fichier via FileSystem.uploadAsync
    const uploadFile = async (signedUrl: string, fileUri: string) => {
        try {
            const uploadResult = await FileSystem.uploadAsync(signedUrl, fileUri, {
                httpMethod: "PUT",
                headers: {
                    'content-type': 'image/jpeg',
                    'host': 'storage.googleapis.com'
                },
            });
            if (uploadResult.status !== 200 && uploadResult.status !== 201) {
                throw new Error(`Upload failed with status ${uploadResult.status}`);
            }
            return uploadResult;
        } catch (err) {
            console.error("Exception during upload:", err);
            throw err;
        }
    };

    // Génère un nom de fichier unique pour l'image
    const generateFileName = () => {
        return `photos/${Date.now()}_challenge.jpg`;
    };

    // Capture la photo et affiche l'aperçu
    const handleTakePhoto = async () => {
        const photoUri = await takePhoto();
        if (photoUri) {
            setCapturedPhoto(photoUri);
        }
    };

    // Fonction de compression de l'image (optionnelle)
    const compressImage = async (uri: string) => {
        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [],
                { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
            );
            return manipResult.uri;
        } catch (error) {
            console.error("Erreur lors de la compression:", error);
            throw error;
        }
    };

    // Fonction "Valider" pour lancer le défi
    const handleValidateChallenge = async () => {
        if (!capturedPhoto) {
            Alert.alert("Erreur", "Aucune photo capturée.");
            return;
        }
        if (!objectToGuess.trim()) {
            Alert.alert("Erreur", "Veuillez définir l'objet à faire deviner.");
            return;
        }
        try {
            const compressedUri = await compressImage(capturedPhoto);
            const fileName = generateFileName();
            const res = await fetch(`${API_BASE_URL_SERVER}/generate-signed-url`, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ fileName }),
            });
            const data = await res.json();
            const signedUrl = data.url;
            await uploadFile(signedUrl, compressedUri);
            const finalImageUrl = `https://storage.googleapis.com/ckoisa/${fileName}`;
            // Navigation vers l'écran de jeu en passant les paramètres
            router.push({
                pathname: '/gamescreen',
                params: {
                    challengeImage: finalImageUrl,
                    gameMode: selectedGameMode,
                    totalSteps: selectedSteps.toString(),
                    correctAnswer: objectToGuess,
                },
            });
        } catch (error: any) {
            Alert.alert('Erreur', error.message || "L’upload a échoué");
        }
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.headerTitle}>Défi Photo</Text>
                <Text style={styles.headerDescription}>
                    Prenez une photo d'un objet et passez votre téléphone pour que votre ami devine ce que c'est.
                </Text>
                <View style={styles.gameModeSection}>
                    <Text style={styles.sectionTitle}>Choisir le mode de jeu</Text>
                    <View style={styles.gameModeContainer}>
                        {gamemodes.map(mode => (
                            <TouchableOpacity
                                key={mode.value}
                                style={[
                                    styles.gameModeButton,
                                    selectedGameMode === mode.value && styles.selectedGameModeButton,
                                ]}
                                onPress={() => setSelectedGameMode(mode.value as "floutee" | "cachee")}
                            >
                                <Text style={styles.gameModeButtonText}>{mode.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <View style={styles.stepsSection}>
                    <Text style={styles.sectionTitle}>Choisir le nombre d'étapes</Text>
                    <Picker
                        selectedValue={`${selectedSteps}`}
                        onValueChange={(val) => setSelectedSteps(parseInt(val, 10))}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        {Array.from({ length: 8 }, (_, i) => i + 1).map(step => (
                            <Picker.Item key={step} label={`${step}`} value={`${step}`} />
                        ))}
                    </Picker>
                </View>
                {capturedPhoto && (
                    <View style={styles.capturedPhotoContainer}>
                        <Text style={styles.sectionTitle}>Photo capturée</Text>
                        <Image source={{ uri: capturedPhoto }} style={styles.capturedPhoto} />
                    </View>
                )}
                <TextInput
                    style={styles.correctAnswerInput}
                    placeholder="Définir l'objet à faire deviner"
                    value={objectToGuess}
                    onChangeText={setObjectToGuess}
                />
                <TouchableOpacity style={styles.takePhotoButton} onPress={handleTakePhoto}>
                    <Text style={styles.takePhotoButtonText}>Prendre une photo</Text>
                </TouchableOpacity>
                {capturedPhoto && (
                    <TouchableOpacity style={styles.validateButton} onPress={handleValidateChallenge}>
                        <Text style={styles.validateButtonText}>Lancer</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    scrollContainer: { padding: 20, paddingBottom: 40 },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 10 },
    headerDescription: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
    gameModeSection: { marginBottom: 30 },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10, textAlign: 'center' },
    gameModeContainer: { flexDirection: 'row', justifyContent: 'space-around' },
    gameModeButton: { backgroundColor: '#e0e0e0', borderRadius: 15, paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center' },
    selectedGameModeButton: { backgroundColor: '#e91e63' },
    gameModeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    stepsSection: { marginBottom: 30 },
    picker: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 10, padding: 10 },
    pickerItem: { color: '#000' },
    capturedPhotoContainer: { alignItems: 'center', marginBottom: 20 },
    capturedPhoto: { width: 200, height: 200, borderRadius: 10, marginTop: 10 },
    correctAnswerInput: {
        width: '80%',
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        backgroundColor: '#fff',
        alignSelf: 'center',
    },
    takePhotoButton: {
        backgroundColor: '#e91e63',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10,
        width: '80%',
        alignSelf: 'center',
    },
    takePhotoButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    validateButton: {
        backgroundColor: '#4caf50',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        width: '80%',
        alignSelf: 'center',
    },
    validateButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});