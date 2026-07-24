const API = "/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${url}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    const err = await res.json().catch(() => ({ message: "Error del servidor" }));
    throw new Error(err.message || `Error ${res.status}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

export async function uploadFile(url: string, file: File) {
  const token = getToken();
  const fd = new FormData();
  fd.append("image", file);
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${url}`, { method: "POST", headers, body: fd });
  if (!res.ok) throw new Error("Error al subir archivo");
  return res.json();
}

export const api = {
  get: (url: string) => request(url),
  post: (url: string, data?: unknown) => request(url, { method: "POST", body: JSON.stringify(data) }),
  put: (url: string, data?: unknown) => request(url, { method: "PUT", body: JSON.stringify(data) }),
  delete: (url: string) => request(url, { method: "DELETE" }),
  upload: (url: string, formData: FormData) => {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(`${API}${url}`, { method: "POST", headers, body: formData }).then((r) => {
      if (!r.ok) throw new Error("Error al subir archivo");
      return r.json();
    });
  },
};
