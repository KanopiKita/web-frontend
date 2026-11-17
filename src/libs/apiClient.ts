import type {
  KanopiUser,
  KanopiArea,
  KanopiTree,
  KanopiSpecies,
  KanopiSubmission,
  KanopiIncident,
  KanopiAssignment,
  KanopiAdoptionPackage,
  KanopiOrganization,
  DashboardAggregates
} from '@/types/kanopiTypes'

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return '/v1'
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1'
}

export interface ApiResponse<T = unknown> {
  data: T
  meta?: {
    request_id?: string
    server_time?: string
  }
  error?: {
    code: string
    message: string
    details?: unknown
  }
}

export interface ApiRequestOptions extends RequestInit {
  token?: string
  _retry?: boolean
  skipCache?: boolean
}

const CACHE_TTL_MS = 12_000
const getCache = new Map<string, { timestamp: number; data: unknown }>()
const inflightRequests = new Map<string, Promise<unknown>>()
let refreshPromise: Promise<string | null> | null = null

export function setAuthCookie(accessToken: string) {
  if (typeof document === 'undefined') return
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
  document.cookie = `access_token=${accessToken}; path=/; max-age=86400; SameSite=Lax${isSecure ? '; Secure' : ''}`
}

export function clearAuthSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('user')
  document.cookie = 'access_token=; path=/; max-age=0; SameSite=Lax'
  getCache.clear()
}

async function rotateAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const baseUrl = getApiBaseUrl().replace(/\/$/, '')
      const storedRefresh = localStorage.getItem('refresh_token')

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
            setAuthCookie(data.access_token)
            return data.access_token as string
          }
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
  const { token, _retry = false, skipCache = false, headers = {}, ...customConfig } = options
  const method = (customConfig.method || 'GET').toUpperCase()

  // Invalidasi cache GET setiap kali ada mutasi data
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    getCache.clear()
  }

  const resolvedToken =
    token || (typeof window !== 'undefined' ? localStorage.getItem('access_token') || undefined : undefined)

  const baseUrl = getApiBaseUrl().replace(/\/$/, '')
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${baseUrl}${cleanEndpoint}`
  const cacheKey = `${method}:${url}:${resolvedToken || 'anon'}`

  // Deduplikasi & Short-lived Cache untuk GET request paralel
  if (method === 'GET' && !skipCache && typeof window !== 'undefined') {
    const cached = getCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as T
    }
    const existingInflight = inflightRequests.get(cacheKey)
    if (existingInflight) {
      return existingInflight as Promise<T>
    }
  }

  const defaultHeaders: Record<string, string> = {
    ...(customConfig.body != null ? { 'Content-Type': 'application/json' } : {}),
    Accept: 'application/json',
    ...(headers as Record<string, string>)
  }

  if (resolvedToken) {
    defaultHeaders['Authorization'] = `Bearer ${resolvedToken}`
  }

  // Auto Idempotency Key untuk operasi mutasi
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    if (!defaultHeaders['X-Idempotency-Key']) {
      defaultHeaders['X-Idempotency-Key'] = `web-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    }
  }

  const requestPromise = (async (): Promise<T> => {
    try {
      const response = await fetch(url, {
        headers: defaultHeaders,
        ...customConfig
      })

      // Bila token expired (401), rotasi via refresh_token 1x
      if (response.status === 401 && !_retry && typeof window !== 'undefined' && !endpoint.includes('/auth/login')) {
        const newToken = await rotateAccessToken()
        if (newToken) {
          return apiRequest<T>(endpoint, { ...options, token: newToken, _retry: true, skipCache: true })
        }
      }

      const json = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorMsg = json?.error?.message || json?.message || `Gagal memproses permintaan (${response.status})`
        throw new Error(errorMsg)
      }

      const unpacked = (json.data !== undefined ? json.data : json) as T
      if (method === 'GET' && typeof window !== 'undefined') {
        getCache.set(cacheKey, { timestamp: Date.now(), data: unpacked })
      }
      return unpacked
    } finally {
      inflightRequests.delete(cacheKey)
    }
  })()

  if (method === 'GET' && !skipCache && typeof window !== 'undefined') {
    inflightRequests.set(cacheKey, requestPromise)
  }

  return requestPromise
}

export const KanopiApi = {
  // 1. IAM & Authentication
  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ access_token: string; refresh_token: string; user: KanopiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  registerAdopter: (payload: { name: string; email: string; password: string; phone?: string }) =>
    apiRequest('/adopters/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getCurrentUser: (token?: string) =>
    apiRequest<KanopiUser>('/me', { token }),

  logout: (refreshToken?: string, token?: string) =>
    apiRequest('/auth/logout', {
      method: 'POST',
      body: JSON.stringify(refreshToken ? { refresh_token: refreshToken } : {}),
      token
    }),

  getUsers: (token?: string) =>
    apiRequest<KanopiUser[]>('/users', { token }),

  createUser: (payload: { email: string; name: string; password: string; phone?: string }, token?: string) =>
    apiRequest<KanopiUser>('/users', { method: 'POST', body: JSON.stringify(payload), token }),

  updateUser: (userId: string, payload: { name?: string; phone?: string; password?: string }, token?: string) =>
    apiRequest<KanopiUser>(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify(payload), token }),

  verifyUser: (userId: string, status: 'VERIFIED' | 'REJECTED', token?: string) =>
    apiRequest<KanopiUser>(`/users/${userId}/verify`, { method: 'PATCH', body: JSON.stringify({ status }), token }),

  getRoles: (token?: string) =>
    apiRequest<any[]>('/roles', { token }),

  // 2. Organizations & Mitra
  getOrganizations: (token?: string) =>
    apiRequest<KanopiOrganization[]>('/organizations', { token }),

  createOrganization: (
    payload: {
      name: string
      type: 'COMMUNITY' | 'NGO' | 'GOVERNMENT' | 'CORPORATE'
      contact?: { email?: string; phone?: string; website?: string; address?: string }
    },
    token?: string
  ) =>
    apiRequest<KanopiOrganization>('/organizations', { method: 'POST', body: JSON.stringify(payload), token }),

  verifyOrganization: (orgId: string, verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED', token?: string) =>
    apiRequest<KanopiOrganization>(`/organizations/${orgId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ verification_status: verificationStatus }),
      token
    }),

  // 3. Kawasan Konservasi & Batas WebGIS (Area Module)
  getAdminAreas: (token?: string) =>
    apiRequest<KanopiArea[]>('/admin/areas', { token }),

  getPublicAreas: (token?: string) =>
    apiRequest<KanopiArea[]>('/areas', { token }),

  getAreaDetail: (id: string, token?: string) =>
    apiRequest<KanopiArea>(`/areas/${id}`, { token }),

  createArea: (
    payload: { name: string; org_id: string; description?: string; boundaries_geojson?: any; legal_doc_urls?: string[] },
    token?: string
  ) =>
    apiRequest<KanopiArea>('/admin/areas', { method: 'POST', body: JSON.stringify(payload), token }),

  publishArea: (areaId: string, token?: string) =>
    apiRequest<KanopiArea>(`/admin/areas/${areaId}/publish`, { method: 'POST', token }),

  // 4. Inventaris & Review Pohon (Registry & Review Module)
  getAdminTrees: (
    params?: { area_id?: string; lifecycle_status?: string; adoption_status?: string; page?: number; limit?: number },
    token?: string
  ) => {
    const query = new URLSearchParams()
    if (params?.area_id) query.append('area_id', params.area_id)
    if (params?.lifecycle_status) query.append('lifecycle_status', params.lifecycle_status)
    if (params?.adoption_status) query.append('adoption_status', params.adoption_status)
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    const qs = query.toString()
    return apiRequest<KanopiTree[]>(`/admin/trees${qs ? `?${qs}` : ''}`, { token })
  },

  getPublicTrees: (params?: { area_id?: string; page?: number; limit?: number }, token?: string) => {
    const query = new URLSearchParams()
    if (params?.area_id) query.append('area_id', params.area_id)
    if (params?.page) query.append('page', String(params.page))
    if (params?.limit) query.append('limit', String(params.limit))
    const qs = query.toString()
    return apiRequest<KanopiTree[]>(`/trees${qs ? `?${qs}` : ''}`, { token })
  },

  getReviewQueue: (token?: string) =>
    apiRequest<KanopiSubmission[]>('/admin/review-queue', { token }),

  reviewSubmission: (
    submissionId: string,
    payload: { decision: 'APPROVED' | 'REVISION_REQUIRED' | 'REJECTED'; notes?: string; affected_sections?: string[] },
    token?: string
  ) =>
    apiRequest(`/admin/submissions/${submissionId}/review`, { method: 'POST', body: JSON.stringify(payload), token }),

  publishTree: (treeId: string, token?: string) =>
    apiRequest<KanopiTree>(`/admin/trees/${treeId}/publish`, { method: 'POST', token }),

  updateTreeAvailability: (
    treeId: string,
    status: 'ELIGIBLE' | 'AVAILABLE' | 'RESERVED' | 'ADOPTED' | 'UNAVAILABLE',
    token?: string
  ) =>
    apiRequest<KanopiTree>(`/admin/trees/${treeId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      token
    }),

  // 5. Adopsi & Transaksi (Commerce Module)
  getAdoptionPackages: (token?: string) =>
    apiRequest<KanopiAdoptionPackage[]>('/adoption-packages', { token }),

  getMyAdoptions: (token?: string) =>
    apiRequest<any[]>('/me/adoptions', { token }),

  createAdoptionOrder: (payload: { tree_id: string; package_id: string; org_id?: string }, token?: string) =>
    apiRequest('/adoption-orders', { method: 'POST', body: JSON.stringify(payload), token }),

  simulatePaymentWebhook: (provider: 'midtrans' | 'xendit', orderNo: string) =>
    apiRequest(`/webhooks/payments/${provider}`, {
      method: 'POST',
      body: JSON.stringify({ order_id: orderNo, transaction_status: 'settlement' })
    }),

  verifyCertificateToken: (tokenString: string) =>
    apiRequest(`/certificates/verify/${encodeURIComponent(tokenString)}`),

  // 6. Penugasan Lapangan & Jadwal (Assignment Module)
  getAdminAssignments: (status?: string, token?: string) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : ''
    return apiRequest<KanopiAssignment[]>(`/admin/assignments${qs}`, { token })
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
    apiRequest<KanopiAssignment>('/admin/assignments', { method: 'POST', body: JSON.stringify(payload), token }),

  cancelAssignment: (assignmentId: string, reason = 'Dibatalkan oleh Admin', token?: string) =>
    apiRequest<KanopiAssignment>(`/admin/assignments/${assignmentId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
      token
    }),

  // 7. Insiden & Triage Pohon (Incident Module)
  getAdminIncidents: (token?: string) =>
    apiRequest<KanopiIncident[]>('/admin/incidents', { token }),

  reportIncident: (
    payload: { tree_id: string; severity: 'low' | 'medium' | 'high' | 'critical'; description: string },
    token?: string
  ) =>
    apiRequest<KanopiIncident>('/incidents', { method: 'POST', body: JSON.stringify(payload), token }),

  // 8. Master Data (Species & Form Template)
  getMasterSpecies: (token?: string) =>
    apiRequest<KanopiSpecies[]>('/species', { token }),

  createSpecies: (
    payload: { local_name: string; scientific_name: string; family?: string; native?: boolean; iucn_status?: string },
    token?: string
  ) =>
    apiRequest<KanopiSpecies>('/admin/species', { method: 'POST', body: JSON.stringify(payload), token }),

  getAdminFormTemplates: (token?: string) =>
    apiRequest<any[]>('/admin/form-templates', { token }),

  createFormTemplate: (
    payload: {
      task_type: string
      version: number
      schema: Record<string, any>
      evidence_rules?: Record<string, any>
    },
    token?: string
  ) =>
    apiRequest('/admin/form-templates', { method: 'POST', body: JSON.stringify(payload), token }),

  // 9. Aggregated Dashboard Overview
  getDashboardAggregates: async (token?: string): Promise<DashboardAggregates | null> => {
    try {
      const [areasRes, treesRes, reviewQueueRes, incidentsRes] = await Promise.all([
        apiRequest<KanopiArea[]>('/admin/areas', { token })
          .catch(() => apiRequest<KanopiArea[]>('/areas', { token }).catch(() => [])),
        apiRequest<KanopiTree[]>('/admin/trees', { token })
          .catch(() => apiRequest<KanopiTree[]>('/trees', { token }).catch(() => [])),
        apiRequest<KanopiSubmission[]>('/admin/review-queue', { token }).catch(() => []),
        apiRequest<KanopiIncident[]>('/admin/incidents', { token }).catch(() => [])
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
