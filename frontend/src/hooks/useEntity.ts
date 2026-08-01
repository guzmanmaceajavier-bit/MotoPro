import { useState, useEffect, useCallback } from "react";
import { createEntityApi } from "@/api/entities";

export function useEntityList<T = any>(basePath: string, params?: Record<string, string>) {
  const api = createEntityApi<T>(basePath);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(() => {
    setLoading(true);
    api.list(params).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [basePath, JSON.stringify(params)]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useEntity<T = any>(basePath: string, id: string | undefined) {
  const api = createEntityApi<T>(basePath);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) { setData(null); setLoading(false); return; }
    setLoading(true);
    api.getById(id).then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [basePath, id]);

  return { data, loading, error };
}

export function useChildEntities<T = any>(parentPath: string, parentId: string | undefined, childPath: string) {
  const fullPath = parentId ? `/${parentPath}/${parentId}/${childPath}` : "";
  return useEntityList<T>(fullPath);
}
