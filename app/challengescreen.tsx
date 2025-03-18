import React, { useState, useContext } from 'react';
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import Constants from 'expo-constants';
import { AuthContext } from '../src/contexts/AuthContext';

export default function ChallengeScreen() {
    const [selectedGameMode, setSelectedGameMode] = useState<'floutee' | 'cachee'>('floutee');
    const [selectedSteps, setSelectedSteps] = useState<number>(1);
    const [objectToGuess, setObjectToGuess] = useState<string>('');
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const insets = useSafeAreaInsets();
    const router = useRouter();

    // Paramètres pour un défi à un ami (optionnel)
    const { friendName, friendPhoto, friendId, friendUUID } = useLocalSearchParams();
    const { token, userInfo } = useContext(AuthContext);

    const API_BASE_URL_API = Constants.expoConfig?.extra?.API_BASE_URL_API || 'http://192.168.144.61:8082';
    const API_BASE_URL_SERVER = Constants.expoConfig?.extra?.API_BASE_URL_SERVER || 'http://192.168.144.61:3000';

    const gamemodes = [
        { label: 'Floutée', value: 'floutee' },
        { label: 'Cachée', value: 'cachee' },
    ];

    // Fonction pour demander la permission et prendre la photo
    const handleTakePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert("Permission refusée", "La permission d'utiliser l'appareil photo est nécessaire.");
            return;
        }
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 1,
        });
        if (result.cancelled) return;
        if (result.assets && result.assets.length > 0) {
            setCapturedPhoto(result.assets[0].uri);
        }
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

    // Compression de l'image
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

    // Fonction pour créer le défi (appel POST vers /games)
    const createGame = async (targetId: string, imageUrl: string) => {
        const gamePayload = {
            playerId: userInfo?.id, // l'ID du joueur actuel
            playerIdTarget: targetId,
            status: "En attente",
            urlImage: imageUrl,
            gameMode: selectedGameMode,
            etape: selectedSteps,
            correctionAnswers: objectToGuess,
        };

        const response = await fetch(`${API_BASE_URL_API}/games`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(gamePayload),
        });

        if (!response.ok) {
            throw new Error(`Erreur lors de la création du défi: ${response.status}`);
        }
        return response.json();
    };

    // Envoi du défi à un ami
    const handleSendFriendChallenge = async () => {
        if (!capturedPhoto) {
            Alert.alert("Erreur", "Aucune photo capturée.");
            return;
        }
        if (!objectToGuess.trim()) {
            Alert.alert("Erreur", "Veuillez définir l'objet à faire deviner.");
            return;
        }
        if (!friendId) {
            Alert.alert("Erreur", "Aucun ami sélectionné.");
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
            // Pour un défi à un ami, le target est l'ID de l'ami
            await createGame(friendUUID, finalImageUrl);
            Alert.alert("Succès", "Défi envoyé à votre ami !");
            // Retourner à l'accueil
            router.push("/");
        } catch (error: any) {
            Alert.alert('Erreur', error.message || "L’upload a échoué");
        }
    };


    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>
                        Défi pour {friendName ? friendName : "Moi-même"}
                    </Text>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            <Image style={styles.avatar} source={{ uri: userInfo?.avatar }} />
                            <Text style={styles.usernameLabel}>Toi</Text>
                            <Text style={styles.username}>Par {userInfo?.pseudo}</Text>
                        </View>
                        {friendId && (
                            <View style={styles.avatarContainer}>
                                <Image style={styles.avatar} source={{ uri: friendPhoto }} />
                                <Text style={styles.usernameLabel}>Ami</Text>
                                <Text style={styles.username}>{friendName}</Text>
                            </View>
                        )}
                    </View>
                </View>
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
                                onPress={() => setSelectedGameMode(mode.value)}
                            >
                                <Text style={styles.gameModeButtonText}>{mode.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <View style={styles.stepsSection}>
                    <Text style={styles.sectionTitle}>Choisir le nombre d'étapes</Text>
                    <Picker
                        selectedValue={String(selectedSteps)}
                        onValueChange={(value) => setSelectedSteps(parseInt(value, 10))}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        {Array.from({ length: 8 }, (_, i) => i + 1).map(step => (
                            <Picker.Item key={step} label={`${step}`} value={`${step}`} />
                        ))}
                    </Picker>
                </View>
                <TextInput
                    style={styles.correctAnswerInput}
                    placeholder="Définir l'objet à faire deviner"
                    value={objectToGuess}
                    onChangeText={setObjectToGuess}
                />
                {/* Bouton pour prendre la photo */}
                <TouchableOpacity style={styles.takePhotoButton} onPress={handleTakePhoto}>
                    <Text style={styles.takePhotoButtonText}>Prendre la photo</Text>
                </TouchableOpacity>
                {/* Affichage de l'aperçu de la photo capturée */}
                {capturedPhoto && (
                    <View style={styles.capturedPhotoContainer}>
                        <Text style={styles.sectionTitle}>Photo capturée</Text>
                        <Image source={{ uri: capturedPhoto }} style={styles.capturedPhoto} />
                    </View>
                )}
                <View style={styles.buttonsContainer}>
                    {friendId && (
                        <TouchableOpacity style={styles.challengeButton} onPress={handleSendFriendChallenge}>
                            <Text style={styles.challengeButtonText}>Envoyer le défi à mon ami</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    scrollContainer: { padding: 20, paddingBottom: 40 },
    header: { alignItems: 'center', marginBottom: 30 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    avatarSection: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', width: '100%' },
    avatarContainer: { alignItems: 'center' },
    avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#ccc', marginBottom: 5 },
    usernameLabel: { fontSize: 16, color: '#666' },
    username: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 10 },
    gameModeSection: { marginBottom: 30 },
    gameModeContainer: { flexDirection: 'row', justifyContent: 'space-around' },
    gameModeButton: { backgroundColor: '#e0e0e0', borderRadius: 15, paddingVertical: 10, paddingHorizontal: 20, alignItems: 'center' },
    selectedGameModeButton: { backgroundColor: '#e91e63' },
    gameModeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    stepsSection: { marginBottom: 30 },
    picker: { width: '100%', height: 50, backgroundColor: '#fff', borderRadius: 10, padding: 10 },
    pickerItem: { color: '#000' },
    correctAnswerInput: { width: '80%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 10, paddingHorizontal: 15, marginBottom: 20, backgroundColor: '#fff', alignSelf: 'center' },
    takePhotoButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    takePhotoButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    capturedPhotoContainer: { alignItems: 'center', marginBottom: 20 },
    capturedPhoto: { width: 200, height: 200, borderRadius: 10, marginTop: 10 },
    buttonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
    challengeButton: { backgroundColor: '#e91e63', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', flex: 1, marginHorizontal: 5 },
    challengeButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});