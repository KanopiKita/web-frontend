/**
 * Kanopi Kita Backend API Client
 * Berkomunikasi langsung dengan NestJS + Fastify Modular Monolith Backend (/v1/...)
 * Menyesuaikan struktur EnvelopeInterceptor: { data, meta, error }
 */

export function getApiBaseUrl(): string {
  // Bila di browser dan bukan di localhost langsung, lewatkan melalui reverse proxy path /v1
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
}

export async function apiRequest<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
  const { token, headers = {}, ...customConfig } = options

  const defaultHeaders: Record<string, string> = {
    ...(customConfig.body != null ? { 'Content-Type': 'application/json' } : {}),
    Accept: 'application/json',
    ...(headers as Record<string, string>)
  }

  // Ambil token dari param atau dari localStorage otomatis
  const resolvedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('access_token') || undefined : undefined)
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

  const json = await response.json().catch(() => ({}))

  if (!response.ok) {
    const errorMsg = json?.error?.message || json?.message || `API Error: ${response.status} ${response.statusText}`
    throw new Error(errorMsg)
  }

  // Unpack Envelope Response dari backend Fastify EnvelopeInterceptor
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

  getCurrentUser: (token?: string) =>
    apiRequest('/me', { token }),

  logout: (token?: string) =>
    apiRequest('/auth/logout', { method: 'POST', token }),

  getUsers: (token?: string) =>
    apiRequest<any[]>('/users', { token }),

  // 2. Kawasan Konservasi & Batas WebGIS (Area Module)
  getAdminAreas: (token?: string) =>
    apiRequest<any[]>('/admin/areas', { token }),

  getPublicAreas: (token?: string) =>
    apiRequest<any[]>('/areas', { token }),

  getAreaDetail: (id: string, token?: string) =>
    apiRequest(`/areas/${id}`, { token }),

  createArea: (payload: { name: string; org_id: string; boundaries_geojson: any; legal_doc_urls?: string[] }, token?: string) =>
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

  reviewSubmission: (submissionId: string, payload: { decision: 'APPROVED' | 'REJECTED' | 'REVISION_REQUESTED'; notes?: string; tags?: string[] }, token?: string) =>
    apiRequest(`/admin/submissions/${submissionId}/review`, { method: 'POST', body: JSON.stringify(payload), token }),

  publishTree: (treeId: string, token?: string) =>
    apiRequest(`/admin/trees/${treeId}/publish`, { method: 'POST', token }),

  updateTreeAvailability: (treeId: string, status: 'AVAILABLE' | 'RESERVED' | 'ADOPTED' | 'UNAVAILABLE', token?: string) =>
    apiRequest(`/admin/trees/${treeId}/availability`, { method: 'PATCH', body: JSON.stringify({ status }), token }),

  // 4. Adopsi & Transaksi (Commerce Module)
  getAdoptionPackages: (token?: string) =>
    apiRequest<any[]>('/adoption-packages', { token }),

  getMyAdoptions: (token?: string) =>
    apiRequest<any[]>('/me/adoptions', { token }),

  verifyCertificateToken: (tokenString: string) =>
    apiRequest(`/certificates/verify/${tokenString}`),

  // 5. Penugasan Lapangan & Jadwal (Assignment Module)
  getAdminAssignments: (status?: string, token?: string) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : ''
    return apiRequest<any[]>(`/admin/assignments${qs}`, { token })
  },

  createAssignment: (payload: { title: string; surveyor_id: string; area_id: string; target_count: number; due_date: string }, token?: string) =>
    apiRequest('/admin/assignments', { method: 'POST', body: JSON.stringify(payload), token }),

  cancelAssignment: (assignmentId: string, token?: string) =>
    apiRequest(`/admin/assignments/${assignmentId}/cancel`, { method: 'POST', token }),

  // 6. Insiden & Triage Pohon (Incident Module)
  getAdminIncidents: (token?: string) =>
    apiRequest<any[]>('/admin/incidents', { token }),

  reportIncident: (payload: { tree_id: string; incident_type: string; description: string; evidence_urls?: string[] }, token?: string) =>
    apiRequest('/incidents', { method: 'POST', body: JSON.stringify(payload), token }),

  // 7. Master Data (Species & Form Template)
  getMasterSpecies: (token?: string) =>
    apiRequest<any[]>('/species', { token }),

  createSpecies: (payload: { local_name: string; scientific_name: string; wood_density?: number; carbon_rate?: number }, token?: string) =>
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
