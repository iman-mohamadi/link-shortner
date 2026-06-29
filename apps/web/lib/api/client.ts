const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  token?: string;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      // Also clear the persisted zustand store so a reload stays logged out.
      localStorage.removeItem('auth-storage');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const method = (options.method ?? 'GET').toUpperCase();

    // Don't send Content-Type on body-less methods.
    // Fastify's JSON body-parser sees the header and returns 400 when the body
    // is empty (which it always is for GET/DELETE/HEAD).
    const hasBody = method !== 'GET' && method !== 'DELETE' && method !== 'HEAD';

    const headers: Record<string, string> = {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Some responses (e.g. 204) have no JSON body.
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // A 401 on an authenticated request means the session is gone/expired.
      // Centralize logout + redirect here so every page recovers gracefully.
      // (The OTP endpoints are called without a token, so they're unaffected.)
      if (response.status === 401 && this.token) {
        this.clearToken();
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
          const next = encodeURIComponent(window.location.pathname);
          window.location.href = `/auth?next=${next}`;
        }
      }
      throw new ApiError(
        response.status,
        data.error || data.message || 'An error occurred',
        data
      );
    }

    return data;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
