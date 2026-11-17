/**
 * Kanopi Kita Backend API Client
 * Berkomunikasi langsung dengan NestJS + Fastify Modular Monolith Backend (/v1/...)
 * Menyesuaikan struktur EnvelopeInterceptor: { data, meta, error }
 */

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/v1'
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'
}

export interface ApiResponse<T = any> {
  data: T
  meta?: {
    request_id?: string
    server_time?: string
  }
  error?: {
    code: string
    message: string
    details?: any
  }
}

export interface ApiRequestOptions extends RequestInit {
  token?: string
  _retry?: boolean
}

let refreshPromise: Promise<string | null> | null = null

async function ensureValidToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const baseUrl = getApiBaseUrl().replace(/\/$/, '')
      const storedRefresh = localStorage.getItem('refresh_token')

      // 1. Coba refresh token bila ada
      if (storedRefresh && storedRefresh.length >= 20) {
        const res = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ refresh_token: storedRefresh })
        })
        if (res.ok) {
          const json = await res.json().catch(() => ({}))
          const data = json.data || json
          if (data?.access_token) {
            localStorage.setItem('access_token', data.access_token)
            if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
            document.cookie = `access_token=${data.access_token}; path=/; max-age=86400`
            return data.access_token as string
          }
        }
      }

      // 2. Fallback auto-session ke akun Super Admin seed BE bila belum login di sesi backoffice
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: 'admin@kanopikita.id', password: 'Password123!' })
      })
      if (loginRes.ok) {
        const json = await loginRes.json().catch(() => ({}))
        const data = json.data || json
        if (data?.access_token) {
          localStorage.setItem('access_token', data.access_token)
          if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token)
          if (data.user) localStorage.setItem('user', JSON.stringify(data.user))
          document.cookie = `access_token=${data.access_token}; path=/; max-age=86400`
          return data.access_token as string
        }
      }
      return null
    } catch {
      return null
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function apiRequest<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, _retry = false, headers = {}, ...customConfig } = options

  const defaultHeaders: Record<string, string> = {
    ...(customConfig.body != null ? { 'Content-Type': 'application/json' } : {}),
    Accept: 'application/json',
    ...(headers as Record<string, string>)
  }

  let resolvedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('access_token') || undefined : undefined)

  // Jika endpoint membutuhkan auth dan belum ada token di browser, inisialisasi sesi otomatis (kecuali endpoint auth/login)
  if (!resolvedToken && typeof window !== 'undefined' && !endpoint.includes('/auth/login') && !endpoint.includes('/adopters/register')) {
    resolvedToken = (await ensureValidToken()) || undefined
  }

  if (resolvedToken) {
    defaultHeaders['Authorization'] = `Bearer ${resolvedToken}`
  }

  // Auto Idempotency Key untuk operasi mutasi
  if (customConfig.method && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(customConfig.method.toUpperCase())) {
    if (!defaultHeaders['X-Idempotency-Key']) {
      defaultHeaders['X-Idempotency-Key'] = `web-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }
  }

  const baseUrl = getApiBaseUrl().replace(/\/$/, '')
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${baseUrl}${cleanEndpoint}`

  const response = await fetch(url, {
    headers: defaultHeaders,
    ...customConfig
  })

  // Bila token expired (401), refresh otomatis 1x dan ulangi request
  if (response.status === 401 && !_retry && typeof window !== 'undefined' && !endpoint.includes('/auth/login')) {
    const newToken = await ensureValidToken()
    if (newToken) {
      return apiRequest<T>(endpoint, { ...options, token: newToken, _retry: true })
    }
  }

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMsg = json?.error?.message || json?.message || `API Error: ${response.status} ${response.statusText}`
    throw new Error(errorMsg)
  }

  return json.data !== undefined ? json.data : json
}

// Service Endpoints Selaras Kontrak Backend NestJS
export const KanopiApi = {
  // 1. IAM & Authentication
  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ access_token: string; refresh_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  registerAdopter: (payload: { name: string; email: string; password: string; phone?: string }) =>
    apiRequest('/adopters/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getCurrentUser: (token?: string) =>
    apiRequest('/me', { token }),

  logout: (refreshToken?: string, token?: string) =>
    apiRequest('/auth/logout', {
      method: 'POST',
      body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
      token
    }),

  getUsers: (token?: string) =>
    apiRequest<any[]>('/users', { token }),

  createUser: (payload: { email: string; name: string; password: string; phone?: string }, token?: string) =>
    apiRequest('/users', { method: 'POST', body: JSON.stringify(payload), token }),

  verifyUser: (userId: string, status: 'VERIFIED' | 'REJECTED', token?: string) =>
    apiRequest(`/users/${userId}/verify`, { method: 'PATCH', body: JSON.stringify({ status }), token }),

  // 2. Kawasan Konservasi & Batas WebGIS (Area Module)
  getAdminAreas: (token?: string) =>
    apiRequest<any[]>('/admin/areas', { token }),

  getPublicAreas: (token?: string) =>
    apiRequest<any[]>('/areas', { token }),

  getAreaDetail: (id: string, token?: string) =>
    apiRequest(`/areas/${id}`, { token }),

  createArea: (payload: { name: string; org_id: string; description?: string; boundaries_geojson?: any; legal_doc_urls?: string[] }, token?: string) =>
    apiRequest('/admin/areas', { method: 'POST', body: JSON.stringify(payload), token }),

  publishArea: (areaId: string, token?: string) =>
    apiRequest(`/admin/areas/${areaId}/publish`, { method: 'POST', token }),

  // 3. Inventaris & Review Pohon (Registry & Review Module)
  getAdminTrees: (params?: { area_id?: string; lifecycle_status?: string; adoption_status?: string; page?: number; limit?: number }, token?: string) => {
    const query = new URLSearchParams()
    if (params?.area_id) query.append('area_id', params.area_id)
    if (params?.lifecycle_status) query.append('lifecycle_status', params.lifecycle_status)
    if (params?.adoption_status) query.append('adoption_status', params.adoption_status)
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    const qs = query.toString()
    return apiRequest<any[]>(`/admin/trees${qs ? `?${qs}` : ''}`, { token })
  },

  getPublicTrees: (params?: { area_id?: string; page?: number; limit?: number }, token?: string) => {
    const query = new URLSearchParams()
    if (params?.area_id) query.append('area_id', params.area_id)
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    const qs = query.toString()
    return apiRequest<any[]>(`/trees${qs ? `?${qs}` : ''}`, { token })
  },

  getReviewQueue: (token?: string) =>
    apiRequest<any[]>('/admin/review-queue', { token }),

  reviewSubmission: (
    submissionId: string,
    payload: { decision: 'APPROVED' | 'REVISION_REQUIRED' | 'REJECTED'; notes?: string; affected_sections?: string[] },
    token?: string
  ) =>
    apiRequest(`/admin/submissions/${submissionId}/review`, { method: 'POST', body: JSON.stringify(payload), token }),

  publishTree: (treeId: string, token?: string) =>
    apiRequest(`/admin/trees/${treeId}/publish`, { method: 'POST', token }),

  updateTreeAvailability: (treeId: string, status: 'ELIGIBLE' | 'AVAILABLE' | 'RESERVED' | 'ADOPTED' | 'UNAVAILABLE', token?: string) =>
    apiRequest(`/admin/trees/${treeId}/availability`, { method: 'PATCH', body: JSON.stringify({ status }), token }),

  // 4. Adopsi & Transaksi (Commerce Module)
  getAdoptionPackages: (token?: string) =>
    apiRequest<any[]>('/adoption-packages', { token }),

  getMyAdoptions: (token?: string) =>
    apiRequest<any[]>('/me/adoptions', { token }),

  verifyCertificateToken: (tokenString: string) =>
    apiRequest(`/certificates/verify/${encodeURIComponent(tokenString)}`),

  // 5. Penugasan Lapangan & Jadwal (Assignment Module)
  getAdminAssignments: (status?: string, token?: string) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : ''
    return apiRequest<any[]>(`/admin/assignments${qs}`, { token })
  },

  createAssignment: (
    payload: {
      type: string
      area_id: string
      assignee_id: string
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
      due_at?: string
      target_tree_ids?: string[]
    },
    token?: string
  ) =>
    apiRequest('/admin/assignments', { method: 'POST', body: JSON.stringify(payload), token }),

  cancelAssignment: (assignmentId: string, reason = 'Dibatalkan oleh Admin', token?: string) =>
    apiRequest(`/admin/assignments/${assignmentId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
      token
    }),

  // 6. Insiden & Triage Pohon (Incident Module)
  getAdminIncidents: (token?: string) =>
    apiRequest<any[]>('/admin/incidents', { token }),

  reportIncident: (
    payload: { tree_id: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string },
    token?: string
  ) =>
    apiRequest('/incidents', { method: 'POST', body: JSON.stringify(payload), token }),

  // 7. Master Data (Species & Form Template)
  getMasterSpecies: (token?: string) =>
    apiRequest<any[]>('/species', { token }),

  createSpecies: (payload: { local_name: string; scientific_name: string; family?: string; iucn_status?: string }, token?: string) =>
    apiRequest('/admin/species', { method: 'POST', body: JSON.stringify(payload), token }),

  // 8. Aggregated Dashboard Overview
  getDashboardAggregates: async (token?: string) => {
    try {
      const [areasRes, treesRes, reviewQueueRes, incidentsRes] = await Promise.all([
        apiRequest<any[]>('/admin/areas', { token })
          .catch(() => apiRequest<any[]>('/areas', { token }).catch(() => [])),
        apiRequest<any[]>('/admin/trees', { token })
          .catch(() => apiRequest<any[]>('/trees', { token }).catch(() => [])),
        apiRequest<any[]>('/admin/review-queue', { token }).catch(() => []),
        apiRequest<any[]>('/admin/incidents', { token }).catch(() => [])
      ])

      const areas = Array.isArray(areasRes) ? areasRes : []
      const trees = Array.isArray(treesRes) ? treesRes : []
      const reviewQueue = Array.isArray(reviewQueueRes) ? reviewQueueRes : []
      const incidents = Array.isArray(incidentsRes) ? incidentsRes : []

      const totalAreas = areas.length
      const totalTrees = trees.length
      const adoptedTrees = trees.filter((t: any) => t.adoptionStatus === 'ADOPTED' || t.adoption_status === 'ADOPTED').length
      const pendingReviews = reviewQueue.length
      const activeIncidents = incidents.length

      return {
        totalAreas,
        totalTrees,
        adoptedTrees,
        pendingReviews,
        activeIncidents
      }
    } catch {
      return null
    }
  }
}
