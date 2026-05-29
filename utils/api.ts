import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://sandbank-deprive-driveway.ngrok-free.dev';

// ── Helpers ───────────────────────────────────────────────────────
const getHeaders = () => ({
  'ngrok-skip-browser-warning': 'true',
});

const postHeaders = () => ({
  'Content-Type':               'application/json',
  'ngrok-skip-browser-warning': 'true',
});

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('access_token');
  return {
    'ngrok-skip-browser-warning': 'true',
    'Authorization':              `Bearer ${token}`,
  };
};

const postAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('access_token');
  return {
    'Content-Type':               'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Authorization':              `Bearer ${token}`,
  };
};

// ── Register ──────────────────────────────────────────────────────
export const registerUser = async (userData: {
  name:         string;
  email:        string;
  phone_number: string;
  password:     string;
  category?:    string;
}) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method:  'POST',
    headers: postHeaders(),
    body:    JSON.stringify(userData),
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
    method:  'POST',
    headers: postHeaders(),
    body:    JSON.stringify({ identifier, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Login failed');
  await AsyncStorage.setItem('access_token', data.access_token);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

// ── Get my profile ────────────────────────────────────────────────
export const getMe = async () => {
  const headers  = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/auth/me`, { headers });
  const data     = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to get profile');
  return data;
};

// ── Update profile ────────────────────────────────────────────────
export const updateProfile = async (updates: {
  name?:         string;
  phone_number?: string;
  location?:     string;
  city?:         string;
  category?:     string;
  bio?:          string;
  availability?: boolean;
}) => {
  const headers  = await postAuthHeaders();
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: 'PUT',
    headers,
    body:   JSON.stringify(updates),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Update failed');
  await AsyncStorage.setItem('user', JSON.stringify(data));
  return data;
};

// ── Upload profile picture ────────────────────────────────────────
export const uploadProfilePicture = async (imageUri: string) => {
  const token     = await AsyncStorage.getItem('access_token');
  const formData  = new FormData();
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
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Authorization':              `Bearer ${token}`,
    },
    body: formData,
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
  if (filters?.category)                   params.append('category',     filters.category);
  if (filters?.city)                       params.append('city',         filters.city);
  if (filters?.availability !== undefined) params.append('availability', String(filters.availability));

  const response = await fetch(`${BASE_URL}/auth/users?${params.toString()}`, {
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to fetch users');
  return data;
};

// ── Logout ────────────────────────────────────────────────────────
export const logoutUser = async () => {
  await AsyncStorage.removeItem('access_token');
  await AsyncStorage.removeItem('user');
};

// ── Generate bio from CV ──────────────────────────────────────────
export const generateBioFromCV = async (pdfUri: string): Promise<string> => {
  const token    = await AsyncStorage.getItem('access_token');
  const formData = new FormData();
  const filename = pdfUri.split('/').pop() || 'cv.pdf';

  formData.append('file', {
    uri:  pdfUri,
    name: filename,
    type: 'application/pdf',
  } as any);

  const response = await fetch(`${BASE_URL}/bio/generate`, {
    method:  'POST',
    headers: {
      'ngrok-skip-browser-warning': 'true',
      'Authorization':              `Bearer ${token}`,
    },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Bio generation failed');
  return data.bio;
};

// ── Send hire request ─────────────────────────────────────────────
export const sendHireRequest = async (data: {
  provider_id:    string;
  description:    string;
  scheduled_date: string;
  scheduled_time: string;
  latitude?:      number;
  longitude?:     number;
  address?:       string;
}) => {
  const headers  = await postAuthHeaders();
  const response = await fetch(`${BASE_URL}/hire/request`, {
    method: 'POST',
    headers,
    body:   JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.detail || 'Failed to send request');
  return result;
};

// ── Accept hire request ───────────────────────────────────────────
export const acceptHireRequest = async (requestId: string) => {
  const headers  = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/hire/request/${requestId}/accept`, {
    method: 'PUT',
    headers,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.detail || 'Failed to accept');
  return result;
};

// ── Refuse hire request ───────────────────────────────────────────
export const refuseHireRequest = async (requestId: string) => {
  const headers  = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/hire/request/${requestId}/refuse`, {
    method: 'PUT',
    headers,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.detail || 'Failed to refuse');
  return result;
};

// ── Get notifications ─────────────────────────────────────────────
export const getNotifications = async () => {
  const headers  = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/hire/notifications`, { headers });
  const result   = await response.json();
  if (!response.ok) throw new Error(result.detail || 'Failed to get notifications');
  return result;
};

// ── Mark notification as read ─────────────────────────────────────
export const markNotificationRead = async (notificationId: string) => {
  const headers = await getAuthHeaders();
  await fetch(`${BASE_URL}/hire/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers,
  });
};

// ── Get user public profile ───────────────────────────────────────
export const getUserProfile = async (userId: string) => {
  const response = await fetch(`${BASE_URL}/reviews/profile/${userId}`, {
    headers: getHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to get profile');
  return data;
};

// ── Mark job as completed ─────────────────────────────────────────
export const markJobCompleted = async (requestId: string) => {
  const headers  = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/reviews/complete/${requestId}`, {
    method: 'PUT',
    headers,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to mark completed');
  return data;
};

// ── Submit review ─────────────────────────────────────────────────
export const submitReview = async (data: {
  request_id: string;
  rating:     number;
  comment?:   string;
}) => {
  const headers  = await postAuthHeaders();
  const response = await fetch(`${BASE_URL}/reviews/`, {
    method: 'POST',
    headers,
    body:   JSON.stringify(data),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.detail || 'Failed to submit review');
  return result;
};
// ── Get recommendations ───────────────────────────────────────────
export const getRecommendations = async (params?: {
  category?: string;
  lat?: number;
  lon?: number;
  limit?: number;
}) => {
  const headers = await getAuthHeaders();
  const query   = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.lat)      query.append('lat',      String(params.lat));
  if (params?.lon)      query.append('lon',      String(params.lon));
  if (params?.limit)    query.append('limit',    String(params.limit));

  const url      = `${BASE_URL}/recommendations${query.toString() ? '?' + query.toString() : ''}`;
  const response = await fetch(url, { headers });
  const data     = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to get recommendations');
  return data;
};

// ── Chat ──────────────────────────────────────────────────────────
export const getOrCreateConversation = async (otherUserId: string) => {
  const headers  = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/chat/conversations/${otherUserId}`, { method: 'POST', headers });
  const data     = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to open conversation');
  return data;
};

export const getConversations = async () => {
  const headers  = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/chat/conversations`, { headers });
  const data     = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to load conversations');
  return data;
};

export const getMessages = async (conversationId: string) => {
  const headers  = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/chat/conversations/${conversationId}/messages`, { headers });
  const data     = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to load messages');
  return data;
};

export const sendMessage = async (conversationId: string, content: string) => {
  const headers  = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/chat/conversations/${conversationId}/messages`, {
    method:  'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ content }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to send message');
  return data;
};

// ── Update user profile ───────────────────────────────────────────
export const updateUserProfile = async (updates: {
  city?:         string;
  location?:     string;
  category?:     string;
  bio?:          string;
  availability?: boolean;
  phone_number?: string;
}) => {
  const headers  = await getAuthHeaders();
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method:  'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body:    JSON.stringify(updates),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.detail || 'Failed to update profile');
  return data;
};