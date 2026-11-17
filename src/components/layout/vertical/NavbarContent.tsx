'use client'

import { useState } from 'react'
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

// Component Imports
import NavToggle from './NavToggle'
import ModeDropdown from '@components/layout/shared/ModeDropdown'
import UserDropdown from '@components/layout/shared/UserDropdown'

// Util Imports
import { verticalLayoutClasses } from '@layouts/utils/layoutClasses'

const ROUTE_TITLES: Record<string, { section: string; title: string }> = {
  '/dashboard': { section: 'Overview', title: 'Dashboard Ringkasan Ekologis' },
  '/areas': { section: 'Konservasi & Spasial', title: 'Kawasan & Batas WebGIS (Mapbox GL)' },
  '/trees': { section: 'Konservasi & Spasial', title: 'Inventaris & Review Pohon' },
  '/surveys': { section: 'Konservasi & Spasial', title: 'Batch Hasil Survei Lapangan' },
  '/adoptions': { section: 'Adopsi & Transaksi', title: 'Paket Adopsi & Rekonsiliasi Order' },
  '/carbon-certificates': { section: 'Adopsi & Transaksi', title: 'Sertifikat Digital & Metodologi Karbon' },
  '/incidents': { section: 'Operasional & Tim', title: 'Triage Insiden & Pergantian Pohon' },
  '/calendar': { section: 'Operasional & Tim', title: 'Jadwal Penugasan & Monitoring' },
  '/users': { section: 'Operasional & Tim', title: 'Manajemen Pengguna & RBAC' },
  '/master/species': { section: 'Master Data & Skema', title: 'Master Spesies Pohon & Biomassa' },
  '/master/form-templates': { section: 'Master Data & Skema', title: 'Template Form Survei Mobile' },
  '/master/organizations': { section: 'Master Data & Skema', title: 'Organisasi & Mitra Konservasi' },
  '/settings/account': { section: 'Pengaturan & Kredensial', title: 'Kelola Akun & Profil Saya' },
  '/settings/system': { section: 'Pengaturan & Kredensial', title: 'Kredensial Mapbox, API & Sistem' },
  '/about': { section: 'Informasi', title: 'Tentang Platform Kanopi Kita' }
}

const NavbarContent = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null)

  const currentMeta = ROUTE_TITLES[pathname] || {
    section: 'Kanopi Kita Backoffice',
    title: 'Pusat Kendali Konservasi'
  }

  return (
    <div
      className={classnames(
        verticalLayoutClasses.navbarContent,
        'flex items-center justify-between gap-4 is-full'
      )}
    >
      {/* Left: Nav Toggle & Dynamic Breadcrumb */}
      <div className='flex items-center gap-3 min-w-0'>
        <NavToggle />
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', minWidth: 0 }}>
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
      </div>

      {/* Right: Status Pill, Map Credentials Shortcut, Notifications, Mode, User Profile */}
      <div className='flex items-center gap-2'>
        <Chip
          label='API & PostGIS Live'
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
            display: { xs: 'none', md: 'inline-flex' },
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
                router.push('/dashboard')
              }}
              sx={{ color: '#176B4D', fontWeight: 700, textTransform: 'none' }}
            >
              Lihat Ringkasan Operasional
            </Button>
          </Box>
        </Popover>

        <ModeDropdown />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
