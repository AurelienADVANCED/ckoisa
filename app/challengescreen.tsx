import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import { AuthContext } from '../src/contexts/AuthContext'; 

export default function ChallengeScreen() {
    const [selectedGameMode, setSelectedGameMode] = useState<'floutee' | 'cachee'>('floutee');
    const [selectedSteps, setSelectedSteps] = useState<number>(1);
    const insets = useSafeAreaInsets();
    const { friendName, friendPhoto } = useLocalSearchParams();
    const { token, isAuthenticated, logout, userInfo } = useContext(AuthContext);

    const gamemodes = [
        { label: 'Floutée', value: 'floutee' },
        { label: 'Cachée', value: 'cachee' },
    ];

    const handleSendChallenge = () => {
        const message = `Défi envoyé à: ${friendName}\nMode de jeu: ${selectedGameMode.charAt(0).toUpperCase() + selectedGameMode.slice(1)}\nÉtapes: ${selectedSteps}`;
        Toast.show({
            type: 'success',
            text1: 'Défi envoyé',
            text2: message,
            visibilityTime: 3000,
            autoHide: true,
            topOffset: insets.top + 30,
            bottomOffset: 80,
        });
    };

    return (
        <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Défi pour {friendName}</Text>
                <View style={styles.avatarSection}>
                    <View style={styles.avatarContainer}>
                        <Image style={styles.avatar} source={{ uri: userInfo?.avatar }} />
                        <Text style={styles.usernameLabel}>Toi</Text>
                        <Text style={styles.username}>Par {userInfo?.pseudo}</Text>
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
            <TouchableOpacity style={styles.sendChallengeButton} onPress={handleSendChallenge}>
                <Text style={styles.sendChallengeButtonText}>Envoyer le défi</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    avatarSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
    },
    avatarContainer: {
        alignItems: 'center',
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: '#ccc',
        marginBottom: 5,
    },
    usernameLabel: {
        fontSize: 16,
        color: '#666',
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    gameModeSection: {
        marginBottom: 30,
    },
    gameModeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    gameModeButton: {
        backgroundColor: '#e0e0e0',
        borderRadius: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    selectedGameModeButton: {
        backgroundColor: '#e91e63',
    },
    gameModeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    stepsSection: {
        marginBottom: 30,
    },
    picker: {
        width: '100%',
        height: 50,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 10,
    },
    pickerItem: {
        color: '#000',
    },
    sendChallengeButton: {
        backgroundColor: '#e91e63',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 20,
    },
    sendChallengeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});