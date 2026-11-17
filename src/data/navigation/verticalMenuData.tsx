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
    label: 'Pengguna & Organisasi',
    href: '/users',
    icon: 'ri-user-settings-line'
  }
]

export default verticalMenuData
