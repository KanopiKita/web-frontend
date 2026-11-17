// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'

const verticalMenuData = (): VerticalMenuDataType[] => [
  {
    label: 'Dashboard Ringkasan',
    href: '/dashboard',
    icon: 'ri-dashboard-line'
  },
  {
    label: 'Kawasan & WebGIS',
    href: '/areas',
    icon: 'ri-map-2-line'
  },
  {
    label: 'Inventaris & Review Pohon',
    href: '/trees',
    icon: 'ri-plant-line'
  },
  {
    label: 'Hasil Survei Lapangan',
    href: '/surveys',
    icon: 'ri-file-list-3-line'
  },
  {
    label: 'Adopsi & Invoice',
    href: '/adoptions',
    icon: 'ri-hand-heart-line'
  },
  {
    label: 'Sertifikat & Karbon',
    href: '/carbon-certificates',
    icon: 'ri-award-line'
  },
  {
    label: 'Triage Insiden Pohon',
    href: '/incidents',
    icon: 'ri-alarm-warning-line'
  },
  {
    label: 'Jadwal Monitoring',
    href: '/calendar',
    icon: 'ri-calendar-line'
  },
  {
    label: 'Pengguna & RBAC',
    href: '/users',
    icon: 'ri-user-settings-line'
  },
  {
    label: 'Master Spesies Pohon',
    href: '/master/species',
    icon: 'ri-seedling-line'
  },
  {
    label: 'Template Form Survei',
    href: '/master/form-templates',
    icon: 'ri-survey-line'
  },
  {
    label: 'Organisasi & Mitra',
    href: '/master/organizations',
    icon: 'ri-building-2-line'
  },
  {
    label: 'Kelola Akun & Profil',
    href: '/settings/account',
    icon: 'ri-shield-user-line'
  },
  {
    label: 'Kredensial Map & Sistem',
    href: '/settings/system',
    icon: 'ri-key-2-line'
  }
]

export default verticalMenuData
