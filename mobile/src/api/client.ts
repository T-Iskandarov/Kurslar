import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = 'https://api.kurslarim.uz/api/v1';
export const MEDIA_URL = 'https://api.kurslarim.uz';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Add a request interceptor to inject the token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh / 401s
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (refreshToken) {
          const res = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          if (res.status === 200) {
            const { access } = res.data;
            await AsyncStorage.setItem('access_token', access);
            
            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens (logout)
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
