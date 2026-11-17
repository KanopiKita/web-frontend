'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import classnames from 'classnames'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popover from '@mui/material/Popover'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

// Component Imports
import NavToggle from './NavToggle'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util & API Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'
import { KanopiApi } from '@/libs/apiClient'

const ROUTE_TITLES: Record<string, { section: string; title: string }> = {
  '/dashboard': { section: 'Overview', title: 'Dashboard Ringkasan Ekologis' },
  '/areas': { section: 'Konservasi & Spasial', title: 'Kawasan & Batas WebGIS (Mapbox GL)' },
  '/trees': { section: 'Konservasi & Spasial', title: 'Inventaris & Review Pohon' },
  '/surveys': { section: 'Konservasi & Spasial', title: 'Review Survei & Kanban Board' },
  '/adoptions': { section: 'Adopsi & Transaksi', title: 'Paket Adopsi & Rekonsiliasi Order' },
  '/carbon-certificates': { section: 'Adopsi & Transaksi', title: 'Sertifikat Digital & Metodologi Karbon' },
  '/incidents': { section: 'Operasional & Tim', title: 'Triage Insiden & Pergantian Pohon' },
  '/calendar': { section: 'Operasional & Tim', title: 'Jadwal Penugasan & Monitoring' },
  '/users': { section: 'Operasional & Tim', title: 'Manajemen Pengguna & RBAC' },
  '/master/species': { section: 'Master Data & Skema', title: 'Master Spesies Pohon & Biomassa' },
  '/master/form-templates': { section: 'Master Data & Skema', title: 'Template Form Survei Mobile' },
  '/master/organizations': { section: 'Master Data & Skema', title: 'Organisasi & Mitra Konservasi' },
  '/master/evidence': { section: 'Master Data & Skema', title: 'Pusat Dokumen SK & Bukti Lapangan (EXIF GPS)' },
  '/settings/account': { section: 'Pengaturan & Kredensial', title: 'Kelola Akun & Profil Saya' },
  '/settings/system': { section: 'Pengaturan & Kredensial', title: 'Kredensial Mapbox, API & Sistem' },
  '/settings/audit-log': { section: 'Pengaturan & Kredensial', title: 'Audit Log & Jejak Aktivitas Sistem' },
  '/about': { section: 'Informasi', title: 'Tentang Platform Kanopi Kita' }
}

const QUICK_NAV_ITEMS = [
  { label: 'Dashboard Ringkasan Ekologis', category: 'Modul', href: '/dashboard', icon: 'ri-dashboard-line' },
  { label: 'Peta WebGIS & Polygon Kawasan (Muara Gembong)', category: 'Spasial', href: '/areas', icon: 'ri-map-2-line' },
  { label: 'Inventaris Pohon (KNP-MRG-001 s/d 005)', category: 'Pohon', href: '/trees', icon: 'ri-plant-line' },
  { label: 'Kanban Board & Review Survei Lapangan', category: 'Survei', href: '/surveys', icon: 'ri-kanban-view' },
  { label: 'Pusat Dokumen SK & Foto Bukti EXIF GPS', category: 'Dokumen', href: '/master/evidence', icon: 'ri-folder-shield-2-line' },
  { label: 'Sertifikat Karbon & Cetak PDF (CERT-KNP-2026-0001)', category: 'Sertifikat', href: '/carbon-certificates', icon: 'ri-award-line' },
  { label: 'Master Spesies Pohon (Rhizophora, Mahoni, Meranti)', category: 'Master', href: '/master/species', icon: 'ri-seedling-line' },
  { label: 'Template Form Survei Mobile (Offline Sync)', category: 'Master', href: '/master/form-templates', icon: 'ri-survey-line' },
  { label: 'Organisasi & Lembaga Mitra Konservasi', category: 'Master', href: '/master/organizations', icon: 'ri-building-2-line' },
  { label: 'Audit Log & Riwayat Aktivitas Sistem', category: 'Keamanan', href: '/settings/audit-log', icon: 'ri-history-line' },
  { label: 'Kredensial Mapbox GL & Simulator Payment Webhook', category: 'Sistem', href: '/settings/system', icon: 'ri-key-2-line' },
  { label: 'Kelola Akun & Pindah Sesi Role Cepat', category: 'Akun', href: '/settings/account', icon: 'ri-shield-user-line' }
]

const NavbarContent = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [liveTrees, setLiveTrees] = useState<any[]>([])

  const currentMeta = ROUTE_TITLES[pathname] || {
    section: 'Kanopi Kita Backoffice',
    title: 'Pusat Kendali Konservasi'
  }

  useEffect(() => {
    if (searchOpen && liveTrees.length === 0) {
      KanopiApi.getPublicTrees()
        .then(res => {
          if (Array.isArray(res)) setLiveTrees(res)
        })
        .catch(() => {})
    }
  }, [searchOpen, liveTrees.length])

  const filteredNav = QUICK_NAV_ITEMS.filter(
    item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredTrees = liveTrees.filter(
    t =>
      (t.treeCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.species?.localName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.species?.scientificName || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div
      className={classnames(
        verticalLayoutClasses.navbarContent,
        'flex items-center justify-between gap-4 is-full'
      )}
    >
      {/* Left: Nav Toggle, Dynamic Breadcrumb & Global Search Bar (PRD 2.1) */}
      <div className='flex items-center gap-3 min-w-0 flex-1'>
        <NavToggle />
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', minWidth: 0, mr: 2 }}>
          <Typography
            variant='caption'
            sx={{ color: '#176B4D', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}
          >
            {currentMeta.section}
          </Typography>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            {currentMeta.title}
          </Typography>
        </Box>

        {/* Global Search Trigger Bar (PRD 2.1) */}
        <Box
          onClick={() => setSearchOpen(true)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 0.85,
            borderRadius: '10px',
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            cursor: 'pointer',
            maxWidth: 280,
            flex: { xs: '0 0 auto', md: '1 1 220px' },
            transition: 'all 0.15s ease',
            '&:hover': { borderColor: '#176B4D', bgcolor: '#F4FAF6' }
          }}
        >
          <i className='ri-search-2-line' style={{ fontSize: '1.1rem', color: '#176B4D' }} />
          <Typography
            variant='caption'
            sx={{ display: { xs: 'none', md: 'block' }, color: 'text.secondary', fontWeight: 500, flex: 1 }}
          >
            Cari pohon, kawasan, modul...
          </Typography>
          <Chip
            label='Cari'
            size='small'
            sx={{
              display: { xs: 'none', lg: 'inline-flex' },
              height: 20,
              fontSize: '0.65rem',
              bgcolor: 'background.paper',
              fontWeight: 700
            }}
          />
        </Box>
      </div>

      {/* Right: Status Pill, Map Credentials Shortcut, Notifications, Mode, User Profile */}
      <div className='flex items-center gap-2'>
        <Chip
          label='Sistem Operasional Aktif'
          size='small'
          onClick={() => router.push('/settings/system')}
          icon={
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: '#21865B',
                display: 'inline-block',
                marginLeft: 8
              }}
            />
          }
          sx={{
            display: { xs: 'none', lg: 'inline-flex' },
            bgcolor: '#E7F3EC',
            color: '#176B4D',
            fontWeight: 700,
            fontSize: '0.72rem',
            cursor: 'pointer',
            border: '1px solid #C6E3D2'
          }}
        />

        <IconButton
          size='small'
          title='Kredensial Mapbox & Pengaturan Sistem'
          onClick={() => router.push('/settings/system')}
          sx={{ color: 'text.primary' }}
        >
          <i className='ri-key-2-line' style={{ fontSize: '1.25rem' }} />
        </IconButton>

        <IconButton
          size='small'
          title='Notifikasi Operasional'
          onClick={e => setNotifAnchor(e.currentTarget)}
          sx={{ color: 'text.primary' }}
        >
          <Badge badgeContent={3} color='error'>
            <i className='ri-notification-3-line' style={{ fontSize: '1.25rem' }} />
          </Badge>
        </IconButton>

        <Popover
          open={Boolean(notifAnchor)}
          anchorEl={notifAnchor}
          onClose={() => setNotifAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{ paper: { sx: { width: 340, borderRadius: '14px', mt: 1.5, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } } }}
        >
          <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 700 }}>Notifikasi Operasional</Typography>
            <Chip label='3 Baru' size='small' color='error' sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }} />
          </Box>
          <Divider />
          <List disablePadding>
            <ListItem
              sx={{ px: 3, py: 1.5, cursor: 'pointer', '&:hover': { bgcolor: '#F4FAF6' } }}
              onClick={() => {
                setNotifAnchor(null)
                router.push('/surveys')
              }}
            >
              <ListItemText
                primary={<Typography variant='body2' sx={{ fontWeight: 700 }}>2 Batch Survei Menunggu Review</Typography>}
                secondary='Budi Field Surveyor mengirim BATCH-MRG-2026-01 & 02 dari Muara Gembong.'
              />
            </ListItem>
            <Divider component='li' />
            <ListItem
              sx={{ px: 3, py: 1.5, cursor: 'pointer', '&:hover': { bgcolor: '#F4FAF6' } }}
              onClick={() => {
                setNotifAnchor(null)
                router.push('/incidents')
              }}
            >
              <ListItemText
                primary={<Typography variant='body2' sx={{ fontWeight: 700, color: '#D94B4B' }}>Tiket Insiden Pohon KNP-MRG-003</Typography>}
                secondary='Laporan kemiringan batang akibat gelombang pasang membutuhkan triage.'
              />
            </ListItem>
            <Divider component='li' />
            <ListItem
              sx={{ px: 3, py: 1.5, cursor: 'pointer', '&:hover': { bgcolor: '#F4FAF6' } }}
              onClick={() => {
                setNotifAnchor(null)
                router.push('/carbon-certificates')
              }}
            >
              <ListItemText
                primary={<Typography variant='body2' sx={{ fontWeight: 700, color: '#21865B' }}>Sertifikat CERT-KNP-2026-0001 Terbit</Typography>}
                secondary='Adopsi pohon Mahoni (KNP-MRG-004) oleh Siti Lestari telah terverifikasi.'
              />
            </ListItem>
          </List>
          <Divider />
          <Box sx={{ p: 1.5, textAlign: 'center' }}>
            <Button
              size='small'
              fullWidth
              onClick={() => {
                setNotifAnchor(null)
                router.push('/settings/audit-log')
              }}
              sx={{ color: '#176B4D', fontWeight: 700, textTransform: 'none' }}
            >
              Lihat Audit Log Aktivitas
            </Button>
          </Box>
        </Popover>

        <ModeDropdown />
        <UserDropdown />
      </div>

      {/* Global Search Command Dialog */}
      <Dialog open={searchOpen} onClose={() => setSearchOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ pb: 1.5 }}>
          <TextField
            autoFocus
            fullWidth
            size='small'
            placeholder='Ketik kode pohon (KNP-MRG), spesies, kawasan, atau nama menu...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position='start'>
                    <i className='ri-search-2-line' style={{ color: '#176B4D' }} />
                  </InputAdornment>
                )
              }
            }}
          />
        </DialogTitle>
        <DialogContent dividers sx={{ maxHeight: 400, p: 0 }}>
          {filteredTrees.length > 0 && (
            <Box sx={{ p: 2, borderBottom: '1px solid #EDF2EE' }}>
              <Typography variant='caption' sx={{ fontWeight: 700, color: '#176B4D', px: 1, display: 'block', mb: 1 }}>
                INVENTARIS POHON TERDAFTAR ({filteredTrees.length})
              </Typography>
              {filteredTrees.map(t => (
                <Box
                  key={t.id}
                  onClick={() => {
                    setSearchOpen(false)
                    router.push('/trees')
                  }}
                  sx={{
                    p: 1.5,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': { bgcolor: '#F4FAF6' }
                  }}
                >
                  <Box>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E' }}>
                      🌲 {t.treeCode} — {t.species?.localName}
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#66756D' }}>
                      {t.species?.scientificName} • {t.area?.name}
                    </Typography>
                  </Box>
                  <Chip label={t.adoptionStatus} size='small' sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 700 }} />
                </Box>
              ))}
            </Box>
          )}

          <Box sx={{ p: 2 }}>
            <Typography variant='caption' sx={{ fontWeight: 700, color: '#66756D', px: 1, display: 'block', mb: 1 }}>
              NAVIGASI MODUL & FITUR ({filteredNav.length})
            </Typography>
            {filteredNav.map(nav => (
              <Box
                key={nav.href}
                onClick={() => {
                  setSearchOpen(false)
                  router.push(nav.href)
                }}
                sx={{
                  p: 1.5,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  '&:hover': { bgcolor: '#F4FAF6' }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <i className={nav.icon} style={{ fontSize: '1.2rem', color: '#176B4D' }} />
                  <Typography variant='body2' sx={{ fontWeight: 600, color: '#17251E' }}>
                    {nav.label}
                  </Typography>
                </Box>
                <Chip label={nav.category} size='small' sx={{ bgcolor: '#F0F0F0', fontSize: '0.68rem' }} />
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NavbarContent
