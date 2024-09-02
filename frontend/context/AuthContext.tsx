"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const fetchUserProfile = async (token: string): Promise<User> => {
  return authApi.getUserProfile(token);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  // Au chargement initial, récupérer le token depuis localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Utiliser useSWR pour récupérer les données utilisateur
  const { data, error } = useSWR(
    token ? ["userProfile", token] : null, // clé pour useSWR
    () => fetchUserProfile(token!), // fonction de récupération
  );

  // Mettre à jour l'état en fonction des données récupérées
  useEffect(() => {
    if (data && !error) {
      setUser(data);
      setIsAuthenticated(true);
    } else if (error) {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [data, error]);

  const login = async (email: string, password: string) => {
    try {
      const { user, token } = await authApi.login(email, password);
      localStorage.setItem("token", token); // Stocker le token dans localStorage
      setUser(user);
      setToken(token);
      setIsAuthenticated(true);
      router.push("/");
    } catch (error) {
      console.error("Erreur de connexion:", error);
      alert("Échec de la connexion.");
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem("token"); // Retirer le token de localStorage
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
