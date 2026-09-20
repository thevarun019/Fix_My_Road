const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('roadwatch_token');

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>)
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const text = await response.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!response.ok) {
    const errorMsg =
      data.error ||
      data.reason ||
      data.message ||
      (response.status === 404
        ? 'Backend API not found. Please verify VITE_API_BASE_URL points to your live Render backend.'
        : `Request failed with status ${response.status}`);
    throw new Error(errorMsg);
  }

  return data;
}
