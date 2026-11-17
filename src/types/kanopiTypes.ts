/**
 * Centralized Domain Types for Kanopi Kita Web Dashboard
 */

export type UserRoleCode = 'SUPERADMIN' | 'ADMIN' | 'AREA_OWNER' | 'SURVEYOR' | 'ADOPTER'

export interface KanopiUser {
  id: string
  email: string
  name: string
  phone?: string
  role?: UserRoleCode | string
  active_role?: UserRoleCode | string
  org_id?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  platformVerification?: 'PENDING' | 'VERIFIED' | 'REJECTED'
  capabilities?: string[]
  createdAt?: string
  memberships?: {
    id: string
    orgId: string
    status: string
    role?: { id: string; code: string; name: string }
    organization?: { id: string; name: string }
  }[]
}

export interface KanopiSpecies {
  id: string
  scientificName: string
  localName: string
  family?: string
  native: boolean
  iucnStatus?: string
  status: string
  createdAt?: string
}

export interface KanopiArea {
  id: string
  ownerOrgId?: string
  name: string
  description?: string
  location?: string
  hectares?: number
  legalStatus: string
  legalDocUrls?: string[]
  publicationStatus: 'PUBLISHED' | 'UNPUBLISHED' | string
  boundaries_geojson?: any
  _count?: {
    trees?: number
    assignments?: number
  }
  adopted_count?: number
  ownerOrg?: { id: string; name: string }
  createdAt?: string
  updatedAt?: string
}

export interface KanopiTree {
  id: string
  treeCode: string
  barcodeUid?: string
  areaId: string
  zoneId?: string | null
  speciesId: string
  lifecycleStatus: 'PLANNED' | 'ALIVE' | 'DEAD' | 'MISSING' | 'REPLACED' | string
  healthStatus: 'UNASSESSED' | 'HEALTHY' | 'ATTENTION' | 'UNHEALTHY' | 'CRITICAL' | string
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | string
  publicationStatus: 'UNPUBLISHED' | 'PUBLISHED' | string
  adoptionStatus: 'UNAVAILABLE' | 'ELIGIBLE' | 'RESERVED' | 'ADOPTED' | 'SUSPENDED' | string
  dbhCm?: number
  heightM?: number
  latitude?: number
  longitude?: number
  species?: KanopiSpecies
  area?: { id: string; name: string }
  createdAt?: string
  updatedAt?: string
}

export interface KanopiSubmission {
  id: string
  assignmentId: string
  authorId: string
  taskType: string
  templateId: string
  templateVersion: number
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REVISION_REQUIRED' | 'REJECTED' | string
  payload: Record<string, any>
  payloadChecksum: string
  clientUuid: string
  submittedAt: string
  acceptedAt?: string | null
  author?: { id: string; name: string; email: string }
  assignment?: {
    id: string
    code: string
    type: string
    area?: { id: string; name: string }
  }
}

export interface KanopiIncident {
  id: string
  treeId: string
  reporterId: string
  source: string
  status: string
  severity: 'low' | 'medium' | 'high' | 'critical' | string
  description: string
  createdAt: string
  tree?: {
    id: string
    treeCode: string
    area?: { name: string }
  }
  reporter?: {
    id: string
    name: string
    email: string
  }
}

export interface KanopiAssignment {
  id: string
  code: string
  orgId: string
  type: string
  areaId: string
  assigneeId: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string
  dueAt?: string
  status: string
  assignee?: { id: string; name: string; email: string }
  area?: { id: string; name: string }
  _count?: { targets: number; submissions: number }
  createdAt?: string
}

export interface KanopiAdoptionPackage {
  id: string
  name: string
  amount: string | number
  minNames: number
  maxNames: number
  policyVersion: string
  active: boolean
  createdAt?: string
}

export interface KanopiOrganization {
  id: string
  name: string
  type: 'COMMUNITY' | 'NGO' | 'GOVERNMENT' | 'CORPORATE'
  verifyStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  contact?: {
    email?: string
    phone?: string
    website?: string
    address?: string
  }
  createdAt?: string
}

export interface DashboardAggregates {
  totalAreas: number
  totalTrees: number
  adoptedTrees: number
  pendingReviews: number
  activeIncidents: number
}
