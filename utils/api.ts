import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Replace with your actual IPv4 address from ipconfig
const BASE_URL = 'http://192.168.1.95:8000';

// ── Register ─────────────────────────────────────────────────────
export const registerUser = async (userData: {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  category?: string;
}) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Registration failed');
  // Save token automatically after register
  await AsyncStorage.setItem('access_token', data.access_token);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

// ── Login ─────────────────────────────────────────────────────────
export const loginUser = async (identifier: string, password: string) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Login failed');
  // Save token automatically after login
  await AsyncStorage.setItem('access_token', data.access_token);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

// ── Get current user ──────────────────────────────────────────────
export const getMe = async () => {
  const token = await AsyncStorage.getItem('access_token');
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to get profile');
  return data;
};

// ── Logout ────────────────────────────────────────────────────────
export const logoutUser = async () => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('user');
};