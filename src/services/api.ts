import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import { apiFetch } from './apiClient';

const API_BASE_URL_KEYCLOAK = Constants.expoConfig?.extra?.API_BASE_URL || 'http://192.168.1.21:8080';
const API_BASE_URL_API = Constants.expoConfig?.extra?.API_BASE_URL_API || 'http://192.168.1.21:8082';

/**
 * Décoder le token pour extraire 'sub' (UUID Keycloak).
 */
export function getUserIdFromToken(token: string): string | null {
  try {
    const decoded: any = jwtDecode(token);
    return decoded?.sub || null;
  } catch (err) {
    return null;
  }
}


/**
 * Enregistre l'access token dans SecureStore.
 */
export async function saveToken(token: string) {
  try {
    await SecureStore.setItemAsync('userToken', token, { keychainAccessible: SecureStore.ALWAYS });
  } catch (error) {
  }
}

/**
 * Récupère l'access token depuis SecureStore.
 */
export async function getToken() {
  try {
    return await SecureStore.getItemAsync('userToken');
  } catch (error) {
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
  }
}

/**
 * Récupère le refresh token depuis SecureStore.
 */
export async function getRefreshToken() {
  try {
    return await SecureStore.getItemAsync('userRefreshToken');
  } catch (error) {
    return null;
  }
}

async function createUserBDD(keycloakUuid: string, pseudo: string, authToken: string) {
  const response = await fetch(API_BASE_URL_API + '/playerinfo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      id: keycloakUuid,
      defisEnvoyes: 0,
      defisGagnes: 0,
      defisPerdus: 0,
      points: 0,
      pseudo,
      avatar: 'https://cdn-icons-png.flaticon.com/512/4792/4792944.png'
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Echec de la création de l'utilisateur local: ${errorText}`);
  }
  return await response.json();
}

/**
 * Crée les settings par défaut pour un utilisateur.
 * On suppose ici que les settings par défaut sont :
 *  - profilPublic: true,
 *  - amisVisibles: true,
 *  - defisVisibles: true.
 */
export async function createSettings(token: string) {
  const defaultSettings = {
    profilPublic: true,
    amisVisibles: true,
    defisVisibles: true
  };

  const response = await apiFetch(`${API_BASE_URL_API}/settings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(defaultSettings)
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la création des settings: ${response.status}`);
  }
  return response.json();
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
      `${API_BASE_URL_KEYCLOAK}/realms/master/protocol/openid-connect/token`,
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
    const response = await fetch(`${API_BASE_URL_KEYCLOAK}/admin/realms/CKoisaKeycloak/users`, {
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

    // 3) Se connecter pour récupérer un token (et donc le champ 'sub')
    const tokenData = await loginUser(username, password);
    const accessToken = tokenData.access_token;

    // 4) Extraire l'UUID (sub) puis créer l’utilisateur dans la base locale
    const sub = getUserIdFromToken(accessToken);
    if (!sub) {
      throw new Error('Impossible de récupérer le sub (UUID) dans le token');
    }
    await createUserBDD(sub, username, accessToken);

    // Créer les settings par défaut pour cet utilisateur
    await createSettings(accessToken);

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

    const response = await fetch(`${API_BASE_URL_KEYCLOAK}/realms/CKoisaKeycloak/protocol/openid-connect/token`, {
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

    const response = await fetch(`${API_BASE_URL_KEYCLOAK}/realms/CKoisaKeycloak/protocol/openid-connect/token`, {
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

export async function getPlayerInfo(token: string) {
  const response = await apiFetch(`${API_BASE_URL_API}/playerinfo/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des informations: ${response.status}`);
  }

  return response.json();
}

export async function getPlayerByPseudo(token: string, pseudo: string) {
  const response = await apiFetch(`${API_BASE_URL_API}/playerinfo/pseudo/${pseudo}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des informations: ${response.status}`);
  }

  return response.json();
}

export async function addFriend(token: string, UUID: string) {
  try {
    // Récupérer la liste actuelle d'amis via getMyFriends
    const friendsList = await getMyFriends(token);

    // Vérifier si l'utilisateur est déjà dans la liste des amis
    const alreadyFriend = friendsList.some((friend: { friendId: string }) => friend.friendId === UUID);
    if (alreadyFriend) {
      throw new Error("Cet utilisateur est déjà dans votre liste d'amis.");
    }

    // Ajouter l'ami
    const addResponse = await apiFetch(`${API_BASE_URL_API}/friends/${UUID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!addResponse.ok) {
      throw new Error(`Erreur lors de l'ajout de l'ami: ${addResponse.status}`);
    }

    return await addResponse.json();
  } catch (error) {
    throw error;
  }
}

export async function getMyFriends(token: string) {
  const response = await apiFetch(`${API_BASE_URL_API}/friends/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des informations: ${response.status}`);
  }

  return response.json();
}

export async function getMyGames(token: string) {
  const response = await apiFetch(`${API_BASE_URL_API}/games/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des informations: ${response.status}`);
  }

  return response.json();
}

export async function createGame(
  token: string,
  UUIDTarget: string,
  urlImage: string,
  gameMode: string,
  etape: number
) {
  const payload = {
    playerIdTarget: UUIDTarget,
    urlImage,
    gameMode,
    etape,
    status: "created"
  };

  const response = await apiFetch(`${API_BASE_URL_API}/games`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la création du défi: ${response.status}`);
  }
  return response.json();
}

export async function deleteGame(token: string, gameId: number) {
  const response = await apiFetch(`${API_BASE_URL_API}/games/${gameId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la suppression du jeu: ${response.status}`);
  }
  return response.text();
}

/**
 * Récupère le scoreboard (liste des joueurs triés par points décroissants).
 */
export async function getScoreboard() {
  const response = await fetch(`${API_BASE_URL_API}/scoreboard`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération du scoreboard: ${response.status}`);
  }
  return response.json();
}

/**
 * Récupère les settings associés à l'utilisateur connecté.
 */
export async function getMySettings(token: string) {
  const response = await apiFetch(`${API_BASE_URL_API}/settings/my`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Erreur lors de la récupération des settings: ${response.status}`);
  }
  return response.json();
}

/**
 * Met à jour les settings de l'utilisateur connecté.
 */
export async function updateMySettings(token: string, settings: { profilPublic: boolean; amisVisibles: boolean; defisVisibles: boolean; }) {
  const response = await apiFetch(`${API_BASE_URL_API}/settings/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    throw new Error(`Erreur lors de la mise à jour des settings: ${response.status}`);
  }
  return response.json();
}

export async function updatePlayerStats(token: string, updatedPlayerInfo: any) {
  const response = await apiFetch(`${API_BASE_URL_API}/playerinfo/${updatedPlayerInfo.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updatedPlayerInfo),
  });
  if (!response.ok) {
    throw new Error(`Erreur lors de la mise à jour des stats: ${response.status}`);
  }
  return response.json();
}