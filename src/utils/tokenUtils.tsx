import Constants from 'expo-constants';

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL || 'http://192.168.1.20:8080';

/**
 * Vérifie la validité du token en faisant une requête GET vers l'endpoint /userinfo de Keycloak.
 * Renvoie true si le token est valide, sinon false.
 */
export async function verifyTokenWithKeycloak(token: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/realms/CKoisaKeycloak/protocol/openid-connect/userinfo`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    // Si la réponse est OK, le token est valide
    return response.ok;
  } catch (error) {
    return false;
  }
}