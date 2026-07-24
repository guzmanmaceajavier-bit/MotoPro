const API = "/api";

export function setAuthToken(token: string) {
  if (token) localStorage.setItem("customer_token", token);
  else localStorage.removeItem("customer_token");
}

function getAuthToken() {
  return localStorage.getItem("customer_token") || "";
}

async function request(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${url}`, { headers, ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `Error ${res.status}` }));
    throw new Error(err.message || `Error ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

export const api = {
  get: (url: string) => request(url),
  post: (url: string, data?: unknown) => request(url, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  put: (url: string, data?: unknown) => request(url, { method: "PUT", body: data ? JSON.stringify(data) : undefined }),
  delete: (url: string) => request(url, { method: "DELETE" }),
};

export async function uploadFile(url: string, file: File, field = "image") {
  const fd = new FormData();
  fd.append(field, file);
  const headers: Record<string, string> = {};
  const token = getAuthToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${url}`, { method: "POST", body: fd, headers });
  if (!res.ok) throw new Error("Error al subir archivo");
  const json = await res.json();
  return json.data ?? json;
}
