import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "@/api/client";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  nit?: string;
  avatar?: string;
  total_orders?: number;
  total_spent?: number;
  total_services?: number;
  last_service_date?: string;
  created_at?: string;
}

interface AuthContextType {
  user: Customer | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<Customer>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("customer_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get("/customer-auth/me").then((res) => {
        setUser(res);
      }).catch(() => {
        localStorage.removeItem("customer_token");
        localStorage.removeItem("customer");
        setToken(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post("/customer-auth/login", { email, password });
    const data = res;
    localStorage.setItem("customer_token", data.token);
    localStorage.setItem("customer", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const res = await api.post("/customer-auth/register", { name, email, password, phone });
    const data = res;
    localStorage.setItem("customer_token", data.token);
    localStorage.setItem("customer", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("customer_token");
    localStorage.removeItem("customer");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get("/customer-auth/me");
      setUser(res);
    } catch {}
  };

  const updateProfile = async (data: Partial<Customer>) => {
    await api.put("/customer-auth/profile", data);
    await refreshProfile();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, refreshProfile, updateProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
