
import Constants from 'expo-constants';

// Replace with your actual Replit deployment URL
const API_BASE_URL = 'https://your-repl-name-username.replit.app';

export const apiConfig = {
  baseURL: API_BASE_URL,
  endpoints: {
    auth: {
      user: '/api/auth/user',
      login: '/api/auth/login',
      logout: '/api/auth/logout',
    },
    emergencyPins: '/api/emergency-pins',
    alerts: '/api/alerts',
    users: '/api/users',
    villages: '/api/villages',
    emergencyServices: '/api/emergency-services',
  },
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${apiConfig.baseURL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
};
