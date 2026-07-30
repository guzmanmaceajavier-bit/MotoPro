import { useState } from "react";
import { api } from "@/api/client";

export interface ServiceRequest {
  id: string; name: string; phone: string; email: string;
  brand_model: string; service_type: string; plate: string;
  description: string; status: string; created_at: string;
}

export function useServiceInquiry() {
  const [searchType, setSearchType] = useState<"orden" | "placa" | "cedula">("orden");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ServiceRequest[] | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    setError("");
    if (!trimmed) { setResults([]); setSearched(true); return; }
    if (trimmed.length < 3) { setError("Mínimo 3 caracteres"); return; }
    setSearched(true);
    setLoading(true);
    try {
      const data = await api.get(`/orders/search?q=${encodeURIComponent(trimmed)}&type=${searchType}`);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => { setQuery(""); setResults(null); setSearched(false); setError(""); };

  return { searchType, setSearchType: (t: typeof searchType) => { setSearchType(t); resetSearch(); }, query, setQuery, results, searched, loading, error, handleSearch };
}

export const statusColors: Record<string, string> = {
  pendiente: "bg-yellow-500/10 text-yellow-500",
  "en taller": "bg-blue-500/10 text-blue-500",
  completado: "bg-green-500/10 text-green-500",
  cancelado: "bg-red-500/10 text-red-500",
};

export const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "-";

export const placeholders: Record<string, string> = {
  orden: "Ej: SRV-001", placa: "Ej: ABC-123", cedula: "Ej: 123456789",
};
