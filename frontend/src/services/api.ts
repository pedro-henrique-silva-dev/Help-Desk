const API_BASE = import.meta.env.VITE_API_URL || '/api'

class ApiError extends Error {
  constructor(
    public status: number,
    public data: any
  ) {
    super(data?.error || 'Erro na requisição')
    this.name = 'ApiError'
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token')
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    ;(headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ApiError(response.status, data)
  }

  return data as T
}

export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    register: (data: { name: string; email: string; password: string; role?: string }) =>
      request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<{ user: any }>('/auth/me'),
  },
  tickets: {
    list: (params?: { page?: number; limit?: number; status?: string; category?: string; priority?: string; search?: string }) => {
      const searchParams = new URLSearchParams()
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== '') searchParams.set(key, String(value))
        })
      }
      return request<{ tickets: any[]; pagination: any }>(`/tickets?${searchParams.toString()}`)
    },
    get: (id: string) => request<{ ticket: any }>(`/tickets/${id}`),
    create: (data: any) => request<{ ticket: any }>('/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: any) => request<{ ticket: any }>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<void>(`/tickets/${id}`, { method: 'DELETE' }),
  },
  dashboard: {
    stats: () => request<{ stats: any }>('/dashboard/stats'),
    myStats: () => request<{ stats: any }>('/dashboard/my-stats'),
    recent: () => request<{ tickets: any[] }>('/dashboard/recent'),
    myRecent: () => request<{ tickets: any[] }>('/dashboard/my-recent'),
  },
  users: {
    list: () => request<{ users: any[] }>('/users'),
    get: (id: string) => request<{ user: any }>(`/users/${id}`),
    update: (id: string, data: any) => request<{ user: any }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    delete: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),
  },
}

export { ApiError }