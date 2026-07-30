import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "@/api/client";
import { useAuth } from "@/providers/AuthProvider";

export interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  year?: string;
  plate?: string;
  vin?: string;
  color?: string;
  cilindraje?: string;
}

interface MotoContextType {
  vehicles: Motorcycle[];
  activeVehicle: Motorcycle | null;
  loading: boolean;
  setActiveVehicle: (v: Motorcycle | null) => void;
  refreshVehicles: () => Promise<void>;
}

const MotoContext = createContext<MotoContextType | null>(null);

export function MotoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Motorcycle[]>([]);
  const [activeVehicle, setActiveVehicleState] = useState<Motorcycle | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshVehicles = useCallback(async () => {
    if (!user) { setVehicles([]); setActiveVehicleState(null); return; }
    setLoading(true);
    try {
      const data = await api.get("/vehicles") as any;
      const list = Array.isArray(data) ? data : data?.data ? data.data : [];
      setVehicles(list);
      const savedId = localStorage.getItem("active_vehicle_id");
      if (savedId) {
        const found = list.find((v: Motorcycle) => v.id === savedId);
        if (found) setActiveVehicleState(found);
        else if (list.length > 0) setActiveVehicleState(list[0]);
      } else if (list.length > 0) {
        setActiveVehicleState(list[0]);
      }
    } catch { setVehicles([]); } finally { setLoading(false); }
  }, [user]);

  useEffect(() => { refreshVehicles(); }, [refreshVehicles]);

  const setActiveVehicle = useCallback((v: Motorcycle | null) => {
    setActiveVehicleState(v);
    if (v) localStorage.setItem("active_vehicle_id", v.id);
    else localStorage.removeItem("active_vehicle_id");
  }, []);

  return (
    <MotoContext.Provider value={{ vehicles, activeVehicle, loading, setActiveVehicle, refreshVehicles }}>
      {children}
    </MotoContext.Provider>
  );
}

export function useMoto() {
  const ctx = useContext(MotoContext);
  if (!ctx) throw new Error("useMoto must be used within MotoProvider");
  return ctx;
}
