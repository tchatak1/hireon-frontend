import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Replace with your actual IPv4 address from ipconfig
const BASE_URL = 'http://192.168.1.95:8000';

// ── Register ──────────────────────────────────────────────────────
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
  await AsyncStorage.setItem('access_token', data.access_token);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

// ── Get my profile ────────────────────────────────────────────────
export const getMe = async () => {
  const token = await AsyncStorage.getItem('access_token');
  const response = await fetch(`${BASE_URL}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to get profile');
  return data;
};

// ── Update profile ────────────────────────────────────────────────
export const updateProfile = async (updates: {
  name?:            string;
  phone_number?:    string;
  location?:        string;
  city?:            string;
  category?:        string;
  bio?:             string;
  availability?:    boolean;
}) => {
  const token = await AsyncStorage.getItem('access_token');
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: 'PUT',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Update failed');
  await AsyncStorage.setItem('user', JSON.stringify(data));
  return data;
};

// ── Upload profile picture ────────────────────────────────────────
export const uploadProfilePicture = async (imageUri: string) => {
  const token = await AsyncStorage.getItem('access_token');

  // Build form data
  const formData = new FormData();
  const filename  = imageUri.split('/').pop() || 'photo.jpg';
  const extension = filename.split('.').pop() || 'jpg';
  const mimeType  = `image/${extension === 'jpg' ? 'jpeg' : extension}`;

  formData.append('file', {
    uri:  imageUri,
    name: filename,
    type: mimeType,
  } as any);

  const response = await fetch(`${BASE_URL}/auth/me/upload-picture`, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body:    formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Image upload failed');
  await AsyncStorage.setItem('user', JSON.stringify(data));
  return data;
};

// ── Get all users (home screen) ───────────────────────────────────
export const getAllUsers = async (filters?: {
  category?:     string;
  city?:         string;
  availability?: boolean;
}) => {
  const params = new URLSearchParams();
  if (filters?.category)                        params.append('category', filters.category);
  if (filters?.city)                            params.append('city', filters.city);
  if (filters?.availability !== undefined)      params.append('availability', String(filters.availability));

  const response = await fetch(`${BASE_URL}/auth/users?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to fetch users');
  return data;
};

// ── Logout ────────────────────────────────────────────────────────
export const logoutUser = async () => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('user');
};