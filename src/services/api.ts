import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://192.168.1.21:8080';

/**
 * Enregistre l'access token dans SecureStore.
 */
export async function saveToken(token: string) {
  try {
    await SecureStore.setItemAsync('userToken', token, { keychainAccessible: SecureStore.ALWAYS });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du token", error);
  }
}

/**
 * Récupère l'access token depuis SecureStore.
 */
export async function getToken() {
  try {
    return await SecureStore.getItemAsync('userToken');
  } catch (error) {
    console.error("Erreur lors de la récupération du token", error);
    return null;
  }
}

/**
 * Enregistre le refresh token dans SecureStore.
 */
export async function saveRefreshToken(refreshToken: string) {
  try {
    await SecureStore.setItemAsync('userRefreshToken', refreshToken, { keychainAccessible: SecureStore.ALWAYS });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du refresh token", error);
  }
}

/**
 * Récupère le refresh token depuis SecureStore.
 */
export async function getRefreshToken() {
  try {
    return await SecureStore.getItemAsync('userRefreshToken');
  } catch (error) {
    console.error("Erreur lors de la récupération du refresh token", error);
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
    // Obtenir un token admin depuis le realm master
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
    // Optionnel: Après création, connecte directement l'utilisateur pour obtenir ses tokens.
    const tokenData = await loginUser(username, password);
    return tokenData;
  } catch (error) {
    throw error;
  }
}

/**
 * Connecte un utilisateur en récupérant un token via l'endpoint token de Keycloak.
 * Arguments: username, password.
 * Stocke à la fois l'access token et le refresh token dans SecureStore.
 */
export async function loginUser(username: string, password: string) {
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
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    await saveToken(accessToken);
    await saveRefreshToken(refreshToken);
    return tokenData;
  } catch (error) {
    throw error;
  }
}

/**
 * Rafraîchit l'access token en utilisant le refresh token.
 */
export async function refreshToken() {
  try {
    const storedRefreshToken = await getRefreshToken();
    if (!storedRefreshToken) {
      throw new Error("Refresh token non trouvé");
    }
    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('client_id', 'ckoisa-client');
    formData.append('refresh_token', storedRefreshToken);

    const response = await fetch(`${API_BASE_URL}/realms/CKoisaKeycloak/protocol/openid-connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error_description || 'Échec du rafraîchissement du token');
    }
    const tokenData = await response.json();
    await saveToken(tokenData.access_token);
    await saveRefreshToken(tokenData.refresh_token);
    return tokenData;
  } catch (error) {
    throw error;
  }
}