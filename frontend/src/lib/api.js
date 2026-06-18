const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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

export { API };
