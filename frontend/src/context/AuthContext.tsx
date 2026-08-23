"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch, removeTokens } from "@/lib/api";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  phone: string;
  full_name: string;
  is_staff?: boolean;
  gender?: string;
  birth_date?: string;
  date_joined?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const { access } = getTokens() || {};
      if (!access) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await apiFetch("/auth/profile/");
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          removeTokens();
        }
      } catch (error) {
        console.error("Error fetching profile", error);
        removeTokens();
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    removeTokens();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
