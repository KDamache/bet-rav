import axios from 'axios';

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:3001';
const BETTING_API_URL = import.meta.env.VITE_BETTING_API_URL || 'http://localhost:3002';

export const authApi = axios.create({
  baseURL: `${AUTH_API_URL}/api/auth`,
});

export const bettingApi = axios.create({
  baseURL: `${BETTING_API_URL}/api`,
});

// Intercepteur pour ajouter le token aux requêtes
export const setupAxiosInterceptors = (token: string) => {
  const authHeader = `Bearer ${token}`;
  authApi.defaults.headers.common['Authorization'] = authHeader;
  bettingApi.defaults.headers.common['Authorization'] = authHeader;
};