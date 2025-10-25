import axios, { AxiosError, AxiosInstance } from "axios";
import Constants from "expo-constants";
import { router } from "expo-router";
import { Alert } from "react-native";

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

// instancia global
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

interface AuthStore {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setAccessToken: (token: string) => void;
  logout: () => Promise<void>;
}

let store: AuthStore | null = null;

// Función para conectar el AuthContext a esta instancia
export const setAuthStore = (authStore: AuthStore) => {
  store = authStore;
};

/* ─────────────────────────────
   INTERCEPTORES
───────────────────────────── */

// Request interceptor que adjunta el access token a cada request
api.interceptors.request.use(config => {
  const token = store?.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor que intenta refrescar el token si venció
api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = store?.getRefreshToken();
        if (!refresh) throw new Error("No hay refresh token disponible");

        const res = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
        const newAccess = (res.data as any).access;
        store?.setAccessToken(newAccess);

        // Reintento
        const retryConfig = {
          ...originalRequest,
          headers: {
            ...originalRequest.headers,
            Authorization: `Bearer ${newAccess}`,
          },
        };
        return axios(retryConfig);
      } catch (e: any) {
        console.log("[auth] Refresh falló, cerrando sesión");
        Alert.alert(
            "Sesión expirada",
            "Tu sesión ha caducado. Por seguridad, vuelve a iniciar sesión."
        );
        await store?.logout?.();
        router.push("/login");

        // Marcamos el error para que las vistas puedan ignorarlo
        e.isTokenExpired = true;

        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
