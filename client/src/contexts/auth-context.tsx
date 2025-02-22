
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const { toast } = useToast();

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/status");
      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUsername(data.username || "User");
      } else {
        setIsAuthenticated(false);
        setUsername(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUsername(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async () => {
    try {
      const response = await fetch("/api/auth/login", { 
        method: "POST",
        credentials: "include"
      });
      if (response.ok) {
        await checkAuth();
        toast({ title: "Logged in successfully" });
      } else {
        toast({ title: "Failed to login", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Failed to login", variant: "destructive" });
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { 
        method: "POST",
        credentials: "include"
      });
      if (response.ok) {
        setIsAuthenticated(false);
        setUsername(null);
        toast({ title: "Logged out successfully" });
      }
    } catch (error) {
      toast({ title: "Failed to logout", variant: "destructive" });
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
