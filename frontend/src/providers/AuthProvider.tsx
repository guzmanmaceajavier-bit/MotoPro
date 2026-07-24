import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api, setAuthToken } from "@/api/client";

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  nit?: string;
  avatar?: string;
  total_orders?: number;
  orders?: any[];
}

interface AuthContextType {
  user: CustomerUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<CustomerUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("customer_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      setAuthToken(token);
      api.get("/customer-auth/me").then((u: any) => {
        if (u && u.id) setUser(u);
      }).catch(() => {
        localStorage.removeItem("customer_token");
        setToken(null);
        setAuthToken("");
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.post("/customer-auth/login", { email, password }) as any;
    localStorage.setItem("customer_token", data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const data = await api.post("/customer-auth/register", { name, email, password, phone }) as any;
    localStorage.setItem("customer_token", data.token);
    setAuthToken(data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("customer_token");
    setAuthToken("");
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const u = await api.get("/customer-auth/me") as any;
      if (u && u.id) setUser(u);
    } catch {}
  };

  const updateProfile = async (data: Partial<CustomerUser>) => {
    await api.put("/customer-auth/profile", data);
    await refreshProfile();
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
