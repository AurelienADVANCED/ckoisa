// src/services/apiClient.ts
export type UnauthorizedCallback = () => void;

let unauthorizedCallback: UnauthorizedCallback | null = null;

export function setUnauthorizedCallback(callback: UnauthorizedCallback) {
  unauthorizedCallback = callback;
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, options);
  if (response.status === 401) {
    if (unauthorizedCallback) {
      unauthorizedCallback();
    }
  }
  return response;
}