import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://192.168.1.20:8080';

export async function saveToken(token: string) {
  try {
    await SecureStore.setItemAsync('userToken', token, { keychainAccessible: SecureStore.ALWAYS });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du token", error);
  }
}

export async function getToken() {
  try {
    return await SecureStore.getItemAsync('userToken');
  } catch (error) {
    console.error("Erreur lors de la récupération du token", error);
    return null;
  }
}

/**
 * Crée un nouvel utilisateur dans Keycloak via l'Admin REST API.
 * Nécessite d'obtenir un token admin via le client "admin-cli".
 * Arguments: username, password, email.
 */
export async function registerUser(username: string, password: string, email: string) {
  try {
    // Obtenir un token admin
    const adminTokenResponse = await fetch(
      `${API_BASE_URL}/realms/master/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'password',
          client_id: 'admin-cli',
          username: 'aurelien',
          password: '!4h?acEHA87mmyx4gS6KHEnh8hDD',
        }).toString(),
      }
    );
    console.log(adminTokenResponse);

    if (!adminTokenResponse.ok) {
      const errorData = await adminTokenResponse.json();
      throw new Error(errorData.error_description || 'Erreur lors de la récupération du token admin');
    }
    const adminTokenData = await adminTokenResponse.json();
    const adminToken = adminTokenData.access_token;

    // Créer l'utilisateur via l'Admin REST API
    const response = await fetch(`${API_BASE_URL}/admin/realms/CKoisaKeycloak/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        username,
        email,
        enabled: true,
        credentials: [
          {
            type: "password",
            value: password,
            temporary: false,
          },
        ],
        attributes: {
          id: [username] 
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errorMessage || 'Échec de la création de l\'utilisateur');
    }

    // Optionnel: Après avoir créé l'utilisateur, on peut directement le connecter pour obtenir un token utilisateur.
    const tokenData = await loginUser(username, password);
    return tokenData;
  } catch (error) {
    throw error;
  }
}

/**
 * Connecte un utilisateur en récupérant un token via l'endpoint token de Keycloak.
 * Arguments: username, password.
 */
export async function loginUser(username: string, password: string) {
  console.log(username);
  console.log(password);

  console.log(API_BASE_URL);

  try {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('client_id', 'ckoisa-client');
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_BASE_URL}/realms/CKoisaKeycloak/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_description || 'Échec de la connexion');
    }

    const tokenData = await response.json();
    const token = tokenData.access_token;
    await saveToken(token);
    return tokenData;
  } catch (error) {
    throw error;
  }
}