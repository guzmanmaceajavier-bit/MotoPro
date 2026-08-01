import { api } from "./client";

type EntityMap = {
  testimonials: any;
  team: any;
  values: any;
  "garage-bays": any;
  "process-steps": any;
  facilities: any;
  certifications: any;
  "trust-items": any;
  offers: any;
  faqs: any;
  "blog-categories": any;
  "legal-pages": any;
  coupons: any;
  "shipping-zones": any;
  "payment-methods": any;
  branches: any;
  warehouses: any;
  holidays: any;
  brands: any;
  categories: any;
  services: any;
};

export function createEntityApi<T = any>(basePath: string) {
  const path = basePath.startsWith("/") ? basePath : `/${basePath}`;
  return {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return api.get(`${path}${qs}`) as Promise<T[]>;
    },
    getById: (id: string) => api.get(`${path}/${id}`) as Promise<T>,
    create: (data: Partial<T>) => api.post(path, data) as Promise<{ id: string }>,
    update: (id: string, data: Partial<T>) => api.put(`${path}/${id}`, data),
    remove: (id: string) => api.delete(`${path}/${id}`),
  };
}

export const entityApi: { [K in keyof EntityMap]: ReturnType<typeof createEntityApi<EntityMap[K]>> } & Record<string, ReturnType<typeof createEntityApi>> = {} as any;

const ENTITIES: (keyof EntityMap)[] = [
  "testimonials", "team", "values", "garage-bays", "process-steps",
  "facilities", "certifications", "trust-items", "offers", "faqs",
  "blog-categories", "legal-pages", "coupons", "shipping-zones",
  "payment-methods", "branches", "warehouses", "holidays",
];

ENTITIES.forEach(key => { entityApi[key] = createEntityApi(`/${key}`); });

entityApi.brands = createEntityApi("/brands");
entityApi.categories = createEntityApi("/categories");
entityApi.services = createEntityApi("/services");
