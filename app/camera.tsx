import React, { useEffect, useRef, useState } from 'react';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import * as MediaLibrary from 'expo-media-library';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function App() {
  // Hooks pour les permissions de la caméra et de la médiathèque
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();

  // Etat pour le type de caméra (avant/arrière)
  const [facing, setFacing] = useState<CameraType>('back');
  // Référence pour accéder aux méthodes de la caméra
  const cameraRef = useRef<any>(null);

  const insets = useSafeAreaInsets();

  // Demande automatique des permissions au montage du composant
  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
      if (!mediaPermission?.granted) {
        await requestMediaPermission();
      }
    })();
  }, []);


  // Tant que les permissions ne sont pas encore chargées, on affiche une vue vide
  if (!permission || !mediaPermission) {
    return <View />;
  }

  // Si l'une des permissions n'est toujours pas accordée, on affiche un message d'erreur
  if (!permission.granted || !mediaPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          Les permissions sont nécessaires pour utiliser l'application.
        </Text>
      </View>
    );
  }

  // Fonction pour basculer entre caméra arrière et avant
  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  // Fonction pour prendre une photo et la sauvegarder dans la médiathèque
  async function takePicture() {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync();
        await MediaLibrary.createAssetAsync(photo.uri);
      } catch (error) {
        console.log('Erreur lors de la prise ou de la sauvegarde de la photo :', error);
      }
    }
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing}>
          <View style={styles.buttonContainer}>
            {/* <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
              <Text style={styles.text}>Flip Camera</Text>
            </TouchableOpacity> */}
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.text}>Prendre Photo</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});