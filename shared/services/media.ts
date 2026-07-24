const API = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(url: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API}${url}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Error del servidor' }));
    throw new Error(err.message || `Error ${res.status}`);
  }
  const json = await res.json();
  return json.data ?? json;
}

export const mediaApi = {
  list: (params?: { folder?: string; search?: string; page?: number; limit?: number; trashed?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.folder) q.set('folder', params.folder);
    if (params?.search) q.set('search', params.search);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.trashed) q.set('trashed', '1');
    return request(`/media?${q.toString()}`);
  },
  get: (id: string) => request(`/media/${id}`),
  getUsages: (id: string) => request(`/media/${id}/usages`),
  upload: async (file: File, folder?: string, tags?: string, alt?: string) => {
    const token = getToken();
    const fd = new FormData();
    fd.append('file', file);
    if (folder) fd.append('folder', folder);
    if (tags) fd.append('tags', tags);
    if (alt) fd.append('alt', alt);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${API}/media`, { method: 'POST', headers, body: fd });
    if (!res.ok) throw new Error('Error al subir archivo');
    const json = await res.json();
    return json.data ?? json;
  },
  update: (id: string, data: { name?: string; folder?: string; tags?: string; alt?: string }) =>
    request(`/media/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  trash: (id: string) => request(`/media/${id}/trash`, { method: 'POST' }),
  restore: (id: string) => request(`/media/${id}/restore`, { method: 'POST' }),
  delete: (id: string) => request(`/media/${id}`, { method: 'DELETE' }),
  emptyTrash: () => request('/media/trash/empty', { method: 'POST' }),
  getFolders: () => request('/media/folders'),
  getTags: () => request('/media/tags'),
};
