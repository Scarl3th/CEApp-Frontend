import axios from "axios";
import Constants from "expo-constants";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { setAuthStore } from "./api"; 

const API_BASE_URL = Constants.expoConfig?.extra?.apiBaseUrl;

//TIPOS
type User = {
  id: string;
  email: string;
  nombre: string;
  role: string;
  cargo?: string;
  institucion?: string;
}

type AuthContextType = {
  authToken: string | null;
  refreshToken: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>; 
  logout: () => void;
  setAuthToken: (arg1: string | null) => void;
  createApi: (authToken, refreshToken, setAuthToken) => any;
}

type AuthProviderType = {
  children: ReactNode;
}

//CONTEXTO
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderType) => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  //LOGIN
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await axios.post(`${API_BASE_URL}/token/`, {
        username: email,
        password: password
      }, {timeout: 5000});

      console.log("[auth] Token_obtained:", response.data);

      const authtoken = response.data.access;
      const refreshToken = response.data.refresh;
      const id = response.data.id;
      const nombre = response.data.nombre;
      const role = response.data.role;
      const cargo = response.data.cargo;
      const institucion = response.data.institucion;

      setAuthToken(authtoken);
      setRefreshToken(refreshToken);
      setUser({ id: id, email: email, nombre: nombre, role: role, cargo: cargo, institucion: institucion });

      //Si salió bien creamos un log de inicio de sesión si es un profesional
      if(role == "profesional"){
        try{
          const res = await axios.post(`${API_BASE_URL}/logs/new-session/`, 
            {},
            {headers: { Authorization: `Bearer ${authtoken}`}}
          );
          console.log("[LOG: inicio de sesión] Log de inicio de sesión creado");
        }
        catch (err: unknown){
          if (axios.isAxiosError(err)) {
            console.error(
              "[LOG: inicio de sesión] Error al crear log de inicio de sesión:",
              "Status:", err.response?.status ?? "no disponible",
              "Data:", err.response?.data ?? err.message
            );
          } else {
            console.error("[LOG: inicio de sesión] Error inesperado:", err);
          }
        }
      }

    } catch (error: unknown) {
      console.error("[auth] Error al iniciar sesión:", error);
      throw error;
    }
  };

  //LOGOUT
  const logout = async () => {
    console.log("[auth] Borrando datos...")
    await AsyncStorage.clear();
    setAuthToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  // NUEVO: conectar el AuthProvider con la instancia global de Axios
  setAuthStore({
    getAccessToken: () => authToken,
    getRefreshToken: () => refreshToken,
    setAccessToken: (token: string) => setAuthToken(token),
    logout,
  });

  //API CON INTERCEPTORES
  const createApi = (authToken, refreshToken, setAuthToken) => {
    const api = axios.create({
      baseURL: `${API_BASE_URL}`,
    });

    api.interceptors.request.use(async config => {
      if (authToken) {
        config.headers["Authorization"] = `Bearer ${authToken}`;
      }
      return config;
    });

    api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          if (refreshToken) {
            console.log("[auth] Access token expirado. Intentando refresh...");
            try {
              const res = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                refresh: refreshToken,
              },
              {timeout: 2000});

              const newAccess = res.data.access;
              console.log("[auth] Nuevo access token obtenido:", newAccess);
              
              setAuthToken(newAccess);

              // Reintentar la request original con el nuevo token
              originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;
              return api(originalRequest);
            } catch (e: any) {
              await logout();
              console.log("[auth] Token de refresh expirado");
              Alert.alert(
                "Sesión expirada",
                "Tu sesión ha caducado. Por seguridad, vuelve a iniciar sesión."
              );

              // REDIRECCIONAR AL LOGIN
              router.push("/login");

              e.isTokenExpired = true;
              return Promise.reject(e);
            }
          }
        }
        return Promise.reject(error);
      }
    );

    return api;
  };

  return (
    <AuthContext.Provider value={{ authToken, refreshToken, user, login, logout, createApi, setAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// HOOK PARA USAR EL CONTEXTO
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};