import { useState, useEffect } from "react";
import { api } from "@/api/client";

type Fetcher<T> = () => Promise<T>;

export function useParallelData<T extends Record<string, any>>(fetchers: { [K in keyof T]: Fetcher<T[K]> }) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const entries = Object.entries(fetchers) as [string, Fetcher<any>][];
    Promise.all(entries.map(([, fn]) => fn().catch(() => null)))
      .then(results => {
        const obj = {} as Record<string, any>;
        entries.forEach(([key], i) => { obj[key] = results[i]; });
        setData(obj as T);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useRelatedList(parentPath: string, parentId: string | undefined, relation: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!parentId) { setData([]); return; }
    setLoading(true);
    api.get(`/${parentPath}/${parentId}/${relation}`)
      .then(d => setData(Array.isArray(d) ? d : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [parentPath, parentId, relation]);

  return { data, loading };
}

export function useEntityHierarchy<T extends { id: string; children?: T[] }>(basePath: string) {
  const [tree, setTree] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(basePath).then((data) => {
      const items: T[] = Array.isArray(data) ? data : [];
      setTree(items);
    }).catch(() => setTree([])).finally(() => setLoading(false));
  }, [basePath]);

  return { tree, loading };
}
