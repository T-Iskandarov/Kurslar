const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_URL || 'http://127.0.0.1:8000';

export const getTokens = () => {
  if (typeof window === 'undefined') return null;
  const access = localStorage.getItem('access_token');
  const refresh = localStorage.getItem('refresh_token');
  return { access, refresh };
};

export const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

export const removeTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const { access } = getTokens() || {};
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (typeof window !== 'undefined' && options.body instanceof FormData) {
    // Let browser set Content-Type with boundary
  } else if (!headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (access) {
    headers['Authorization'] = `Bearer ${access}`;
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // If 401, we might need to refresh token (simplified version)
  if (response.status === 401 && access) {
    const { refresh } = getTokens() || {};
    if (refresh) {
      const res = await fetch(`${API_URL}/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (res.ok) {
        const data = await res.json();
        setTokens(data.access, refresh); // Sometimes refresh token is also rotated
        
        // Retry the original request
        headers['Authorization'] = `Bearer ${data.access}`;
        response = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers,
        });
      } else {
        // Refresh failed, logout
        removeTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
  }

  // Safe JSON parsing wrapper to prevent HTML response crashes
  const originalJson = response.json.bind(response);
  response.json = async () => {
    try {
      const text = await response.text();
      return text ? JSON.parse(text) : {};
    } catch (e) {
      console.error("API Error: Response is not valid JSON", e);
      return { detail: "Server xatosi (JSON kutilgan edi)" };
    }
  };

  return response;
};
