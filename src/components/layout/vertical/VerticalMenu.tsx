'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@mui/material/styles'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook & API Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'
import { KanopiApi, clearAuthSession } from '@/libs/apiClient'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

type RenderExpandIconProps = {
  open?: boolean
  transitionDuration?: VerticalMenuContextProps['transitionDuration']
}

type Props = {
  scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
}

const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='ri-arrow-right-s-line' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ scrollMenu }: Props) => {
  const theme = useTheme()
  const router = useRouter()
  const verticalNavOptions = useVerticalNav()
  const { isBreakpointReached, isCollapsed, isHovered, transitionDuration } = verticalNavOptions

  const [activeUser, setActiveUser] = useState({
    name: 'Super Admin Kanopi',
    role: 'SUPERADMIN'
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed?.name) {
            setActiveUser({ name: parsed.name, role: parsed.role || 'SUPERADMIN' })
          }
        } catch {}
      }
    }
  }, [])

  const handleQuickLogout = async () => {
    try {
      const rt = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') || undefined : undefined
      await KanopiApi.logout(rt).catch(() => {})
    } finally {
      clearAuthSession()
      router.push('/login')
    }
  }

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar
  const hideFooterDetails = !isBreakpointReached && isCollapsed && !isHovered

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <ScrollWrapper
          {...(isBreakpointReached
            ? {
                className: 'bs-full overflow-y-auto overflow-x-hidden',
                onScroll: container => scrollMenu(container, false)
              }
            : {
                options: { wheelPropagation: false, suppressScrollX: true },
                onScrollY: container => scrollMenu(container, true)
              })}
        >
          <Menu
            popoutMenuOffset={{ mainAxis: 17 }}
            menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
            renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
            renderExpandedMenuItemIcon={{ icon: <i className='ri-circle-fill' /> }}
            menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
          >
            <MenuItem href='/dashboard' icon={<i className='ri-dashboard-line' />}>
              Dashboard Ringkasan
            </MenuItem>

            <MenuSection label='KONSERVASI & SPASIAL'>
              <MenuItem href='/areas' icon={<i className='ri-map-2-line' />}>
                Kawasan & WebGIS
              </MenuItem>
              <MenuItem href='/trees' icon={<i className='ri-plant-line' />}>
                Inventaris & Review Pohon
              </MenuItem>
              <MenuItem
                href='/surveys'
                icon={<i className='ri-kanban-view' />}
                suffix={<Chip label='2' size='small' sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 700 }} />}
              >
                Survei & Kanban Board
              </MenuItem>
            </MenuSection>

            <MenuSection label='ADOPSI & TRANSAKSI'>
              <MenuItem href='/adoptions' icon={<i className='ri-hand-heart-line' />}>
                Adopsi & Invoice
              </MenuItem>
              <MenuItem href='/carbon-certificates' icon={<i className='ri-award-line' />}>
                Sertifikat & Karbon
              </MenuItem>
            </MenuSection>

            <MenuSection label='OPERASIONAL & TIM'>
              <MenuItem
                href='/incidents'
                icon={<i className='ri-alarm-warning-line' />}
                suffix={<Chip label='2' size='small' sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#FDECEC', color: '#D94B4B', fontWeight: 700 }} />}
              >
                Triage Insiden Pohon
              </MenuItem>
              <MenuItem href='/calendar' icon={<i className='ri-calendar-line' />}>
                Jadwal Monitoring
              </MenuItem>
              <MenuItem href='/users' icon={<i className='ri-user-settings-line' />}>
                Pengguna & RBAC
              </MenuItem>
            </MenuSection>

            <MenuSection label='MASTER DATA & DOKUMEN'>
              <MenuItem href='/master/species' icon={<i className='ri-seedling-line' />}>
                Master Spesies Pohon
              </MenuItem>
              <MenuItem href='/master/form-templates' icon={<i className='ri-survey-line' />}>
                Template Form Survei
              </MenuItem>
              <MenuItem href='/master/organizations' icon={<i className='ri-building-2-line' />}>
                Organisasi & Mitra
              </MenuItem>
              <MenuItem href='/master/evidence' icon={<i className='ri-folder-shield-2-line' />}>
                Pusat Dokumen & Bukti
              </MenuItem>
            </MenuSection>

            <MenuSection label='PENGATURAN & AUDIT'>
              <MenuItem href='/settings/account' icon={<i className='ri-shield-user-line' />}>
                Kelola Akun & Profil
              </MenuItem>
              <MenuItem href='/settings/system' icon={<i className='ri-key-2-line' />}>
                Kredensial Map & Sistem
              </MenuItem>
              <MenuItem href='/settings/audit-log' icon={<i className='ri-history-line' />}>
                Audit Log Aktivitas
              </MenuItem>
            </MenuSection>
          </Menu>
        </ScrollWrapper>
      </Box>

      {/* Bottom User Profile & Quick Sign-Out Widget */}
      {!hideFooterDetails && (
        <Box
          sx={{
            p: 2,
            mx: 2,
            mb: 2,
            borderRadius: '12px',
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5
          }}
        >
          <Box
            onClick={() => router.push('/settings/account')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, cursor: 'pointer' }}
          >
            <Avatar src='/images/avatars/1.png' sx={{ width: 34, height: 34, border: '2px solid #176B4D' }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant='caption'
                sx={{ fontWeight: 700, color: 'text.primary', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {activeUser.name}
              </Typography>
              <Chip
                label={activeUser.role}
                size='small'
                sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 700 }}
              />
            </Box>
          </Box>
          <IconButton
            size='small'
            title='Keluar Cepat (Sign Out)'
            onClick={handleQuickLogout}
            sx={{ color: '#D94B4B', bgcolor: '#FDECEC', '&:hover': { bgcolor: '#fbd5d5' } }}
          >
            <i className='ri-logout-box-r-line' style={{ fontSize: '1rem' }} />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}

export default VerticalMenu
