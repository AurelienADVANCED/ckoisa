import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Image, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export default function ChallengeScreen() {
    const [selectedGameMode, setSelectedGameMode] = useState<'floutee' | 'cachee'>('floutee');
    const [selectedSteps, setSelectedSteps] = useState<number>(1);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { friendName, username, friendPhoto, userPhoto } = useLocalSearchParams();

    const gamemodes = [
        { label: 'Floutée', value: 'floutee' },
        { label: 'Cachée', value: 'cachee' },
    ];

    // Lance la caméra et récupère l'URI de la photo capturée.
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
        if (result.cancelled) return null;
        // Pour expo-image-picker v13 ou ultérieure, l'URI se trouve dans result.assets[0].uri
        return result.assets && result.assets.length > 0 ? result.assets[0].uri : null;
    };

    // Upload du fichier via l'URL signée
    const uploadFile = async (signedUrl: string, fileUri: string) => {
        try {
            // Utilise uploadAsync pour envoyer le fichier directement à l'URL signée
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

    // Capture la photo et affiche l'aperçu (pour le défi à soi-même)
    const handleSendSelfChallenge = async () => {
        const photoUri = await takePhoto();
        if (photoUri) {
            setCapturedPhoto(photoUri);
        }
    };

    const compressImage = async (uri: string) => {
        try {
            // Compresse l'image à 50 % de qualité, en conservant le format JPEG
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [], // Pas d'actions de redimensionnement, on se contente de compresser
                { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
            );
            return manipResult.uri;
        } catch (error) {
            console.error("Erreur lors de la compression:", error);
            throw error;
        }
    };

    // Fonction "Valider" : upload de l'image sur Google Cloud Storage et navigation vers GameScreen
    const handleValidateChallenge = async () => {
        if (!capturedPhoto) {
            Alert.alert("Erreur", "Aucune photo capturée.");
            return;
        }
        try {
            const compressedUri = await compressImage(capturedPhoto);
            const fileName = generateFileName();
            // Appel au backend pour obtenir une URL signée pour l'upload
            const res = await fetch('http://192.168.1.20:3000/generate-signed-url', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ fileName }),
            });
            const data = await res.json();

            const signedUrl = data.url; // URL signée pour PUT

            // Upload de l'image à l'URL signée
            await uploadFile(signedUrl, compressedUri);
            // Construction de l'URL publique finale (supposée accessible)
            const finalImageUrl = `https://storage.googleapis.com/ckoisa/${fileName}`;
            const message = `Défi envoyé à moi-même: ${username}\nMode: ${selectedGameMode.charAt(0).toUpperCase() + selectedGameMode.slice(1)}\nÉtapes: ${selectedSteps}`;
            Toast.show({
                type: 'success',
                text1: 'Défi envoyé à moi-même',
                text2: message,
                visibilityTime: 3000,
                autoHide: true,
                topOffset: insets.top + 30,
                bottomOffset: 80,
            });
            // Navigation vers GameScreen en passant l'URL publique de l'image et d'autres paramètres
            router.push({
                pathname: '/gamescreen',
                params: {
                    challengeImage: finalImageUrl,
                    gameMode: selectedGameMode,
                    totalSteps: selectedSteps.toString(),
                    friendName: username, // Pour défi à soi-même
                    username,
                    friendPhoto: userPhoto,
                    userPhoto,
                },
            });
        } catch (error: any) {
            Alert.alert('Erreur', error.message || "L’upload a échoué");
        }
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Défi pour {friendName}</Text>
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarContainer}>
                            <Image style={styles.avatar} source={{ uri: userPhoto }} />
                            <Text style={styles.usernameLabel}>Toi</Text>
                            <Text style={styles.username}>Par {username}</Text>
                        </View>
                        <View style={styles.avatarContainer}>
                            <Image style={styles.avatar} source={{ uri: friendPhoto }} />
                            <Text style={styles.usernameLabel}>Ami</Text>
                            <Text style={styles.username}>{friendName}</Text>
                        </View>
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
                        selectedValue={selectedSteps}
                        onValueChange={(itemValue) => setSelectedSteps(itemValue)}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                    >
                        {Array.from({ length: 8 }, (_, i) => i + 1).map(step => (
                            <Picker.Item key={step} label={`${step}`} value={step} />
                        ))}
                    </Picker>
                </View>
                {capturedPhoto && (
                    <View style={styles.capturedPhotoContainer}>
                        <Text style={styles.sectionTitle}>Photo capturée</Text>
                        <Image source={{ uri: capturedPhoto }} style={styles.capturedPhoto} />
                    </View>
                )}
                <TouchableOpacity style={styles.sendSelfChallengeButton} onPress={handleSendSelfChallenge}>
                    <Text style={styles.sendChallengeButtonText}>Envoyer le défi à moi-même</Text>
                </TouchableOpacity>
                {capturedPhoto && (
                    <TouchableOpacity style={styles.validateButton} onPress={handleValidateChallenge}>
                        <Text style={styles.sendChallengeButtonText}>Valider</Text>
                    </TouchableOpacity>
                )}
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
    sendSelfChallengeButton: { backgroundColor: '#e91e63', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginBottom: 10 },
    validateButton: { backgroundColor: '#4caf50', paddingVertical: 15, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
    sendChallengeButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    capturedPhotoContainer: { alignItems: 'center', marginBottom: 20 },
    capturedPhoto: { width: 200, height: 200, borderRadius: 10, marginTop: 10 },
});