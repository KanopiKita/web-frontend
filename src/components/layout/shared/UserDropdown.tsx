'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'
import type { MouseEvent } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'

// Hook & API Imports
import { useSettings } from '@core/hooks/useSettings'
import { KanopiApi, clearAuthSession } from '@/libs/apiClient'

const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

interface ActiveUser {
  id?: string
  name: string
  email: string
  role: string
}

const UserDropdown = () => {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<ActiveUser>({
    name: 'Super Admin Kanopi',
    email: 'admin@kanopikita.id',
    role: 'SUPERADMIN'
  })

  const anchorRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { settings } = useSettings()

  useEffect(() => {
    // 1. Cek localStorage terlebih dahulu
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (parsed?.email) {
            setUser({
              id: parsed.id,
              name: parsed.name || 'Admin Kanopi',
              email: parsed.email,
              role: parsed.role || 'SUPERADMIN'
            })
          }
        } catch {}
      }
    }

    // 2. Sinkronisasi dari /v1/me Backend
    KanopiApi.getCurrentUser()
      .then((res: any) => {
        if (res?.email) {
          const activeUser: ActiveUser = {
            id: res.id,
            name: res.name || 'Super Admin Kanopi',
            email: res.email,
            role: res.role || res.active_role || 'SUPERADMIN'
          }
          setUser(activeUser)
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(activeUser))
          }
        }
      })
      .catch(() => {})
  }, [])

  const handleDropdownOpen = () => {
    setOpen(prev => !prev)
  }

  const handleDropdownClose = (event?: MouseEvent<HTMLLIElement> | (MouseEvent | TouchEvent), url?: string) => {
    if (url) {
      router.push(url)
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target as HTMLElement)) {
      return
    }

    setOpen(false)
  }

  const handleUserLogout = async () => {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') || undefined : undefined
      await KanopiApi.logout(refreshToken).catch(() => {})
    } finally {
      clearAuthSession()
      setOpen(false)
      router.push('/login')
    }
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt={user.name}
          src='/images/avatars/1.png'
          onClick={handleDropdownOpen}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[260px] !mbs-4 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper
              elevation={settings.skin === 'bordered' ? 0 : 8}
              {...(settings.skin === 'bordered' && { className: 'border' })}
            >
              <ClickAwayListener onClickAway={e => handleDropdownClose(e as MouseEvent | TouchEvent)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-4 gap-2' tabIndex={-1}>
                    <Avatar alt={user.name} src='/images/avatars/1.png' />
                    <div className='flex items-start flex-col'>
                      <Typography variant='body2' className='font-medium' color='text.primary'>
                        {user.name}
                      </Typography>
                      <Typography variant='caption'>{user.email}</Typography>
                      <Chip
                        label={user.role}
                        size='small'
                        sx={{ mt: 0.5, height: 18, fontSize: '0.65rem', bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 700 }}
                      />
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='gap-3 pli-4' onClick={e => handleDropdownClose(e, '/settings/account')}>
                    <i className='ri-shield-user-line' />
                    <Typography color='text.primary'>Kelola Akun & Profil</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3 pli-4' onClick={e => handleDropdownClose(e, '/settings/system')}>
                    <i className='ri-key-2-line' />
                    <Typography color='text.primary'>Kredensial Map & Sistem</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3 pli-4' onClick={e => handleDropdownClose(e, '/master/species')}>
                    <i className='ri-seedling-line' />
                    <Typography color='text.primary'>Master Spesies & Form</Typography>
                  </MenuItem>
                  <MenuItem className='gap-3 pli-4' onClick={e => handleDropdownClose(e, '/users')}>
                    <i className='ri-user-settings-line' />
                    <Typography color='text.primary'>Manajemen Pengguna & RBAC</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-1.5 pli-4'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='ri-logout-box-r-line' />}
                      onClick={handleUserLogout}
                    >
                      Keluar (Logout)
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
