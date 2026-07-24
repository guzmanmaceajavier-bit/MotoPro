import { useState, useEffect } from "react";
import { api } from "@/api/client";

export interface PageSEOData {
  meta_title?: string;
  meta_description?: string;
  keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  robots?: string;
  schema_json?: Record<string, any>;
}

const cache = new Map<string, PageSEOData>();

export function usePageSEO(pageKey: string): PageSEOData {
  const [seo, setSEO] = useState<PageSEOData>({});

  useEffect(() => {
    if (cache.has(pageKey)) {
      setSEO(cache.get(pageKey)!);
      return;
    }
    api.get(`/cms/seo/${pageKey}`)
      .then((data) => {
        const result: PageSEOData = data || {};
        cache.set(pageKey, result);
        setSEO(result);
      })
      .catch(() => {});
  }, [pageKey]);

  return seo;
}