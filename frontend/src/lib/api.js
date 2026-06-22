const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API = (configuredApiUrl || '/api').replace(/\/+$/, '');
const API_ORIGIN = API.replace(/\/api$/, '');

export function resolveApiAssetUrl(url) {
  if (!url || /^https?:\/\//i.test(url)) return url || '';
  return `${API_ORIGIN}${url.startsWith('/') ? url : `/${url}`}`;
}

export async function apiRequest(path, token, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export { API, API_ORIGIN };
