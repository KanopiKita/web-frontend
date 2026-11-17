'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

// MUI Imports
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import { KanopiApi, setAuthCookie } from '@/libs/apiClient'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

const LoginV2 = ({ mode }: { mode: Mode }) => {
  // States
  const [email, setEmail] = useState('admin@kanopikita.id')
  const [password, setPassword] = useState('Password123!')
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'area_owner' | 'surveyor'>('admin')
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-1-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-1-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-login-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-login-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-login-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-login-light-border.png'

  // Hooks
  const router = useRouter()
  const { settings } = useSettings()
  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const handleRolePreset = (role: 'admin' | 'area_owner' | 'surveyor') => {
    setSelectedRole(role)
    setError(null)
    if (role === 'admin') {
      setEmail('admin@kanopikita.id')
      setPassword('Password123!')
    } else if (role === 'area_owner') {
      setEmail('owner@kanopikita.id')
      setPassword('Password123!')
    } else {
      setEmail('surveyor@kanopikita.id')
      setPassword('Password123!')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await KanopiApi.login({ email, password })
      if (res?.access_token) {
        localStorage.setItem('access_token', res.access_token)
        localStorage.setItem('refresh_token', res.refresh_token)
        localStorage.setItem('user', JSON.stringify(res.user))
        setAuthCookie(res.access_token)
      }
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const redirectTo = params?.get('redirect') || '/dashboard'
      router.push(redirectTo)
    } catch (err: any) {
      setError(err?.message || 'Gagal masuk. Periksa email dan kata sandi Anda.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='flex bs-full min-bs-[100dvh] justify-center overflow-x-hidden is-full'>
      {/* Left Illustration Section (Desktop Only) */}
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden overflow-hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <div className='pli-6 max-lg:mbs-40 lg:mbe-24 flex flex-col items-center max-is-[560px]'>
          <img
            src={characterIllustration}
            alt='character-illustration'
            className='max-bs-[520px] max-is-full bs-auto object-contain'
          />
          <Box className='text-center mbs-6'>
            <Typography variant='h5' sx={{ fontWeight: 700, color: '#176B4D', mb: 1 }}>
              Platform Restorasi Kawasan & Validasi Karbon
            </Typography>
            <Typography variant='body2' sx={{ color: '#66756D', maxWidth: 440 }}>
              Platform terpadu untuk pemantauan kawasan konservasi, verifikasi hasil survei lapangan, dan penerbitan sertifikat adopsi pohon.
            </Typography>
          </Box>
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' alt='auth-mask' />
      </div>

      {/* Right Login Form Container */}
      <div className='flex justify-center items-center bs-full min-bs-[100dvh] bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[520px] overflow-y-auto'>
        <Link href='/' className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>

        <div className='flex flex-col gap-5 is-full sm:is-auto md:is-full sm:max-is-[420px] md:max-is-[unset] mbs-14 sm:mbs-16 md:mbs-0'>
          <div>
            <Typography variant='h4' sx={{ fontWeight: 700, color: '#17251E' }}>
              Selamat Datang! 👋🏻
            </Typography>
            <Typography className='mbs-1' sx={{ color: '#66756D' }}>
              Masuk ke akun Backoffice {themeConfig.templateName} untuk mulai bertugas.
            </Typography>
          </div>

          {/* Quick Role Selection Helper */}
          <Box sx={{ bgcolor: '#F7F9F7', p: 2, borderRadius: '12px', border: '1px solid #DFE7E0' }}>
            <Typography variant='caption' sx={{ color: '#66756D', fontWeight: 600, display: 'block', mb: 1 }}>
              PILIH PERAN CEPAT (PRESET DEMO):
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label='Admin'
                size='small'
                clickable
                color={selectedRole === 'admin' ? 'primary' : 'default'}
                variant={selectedRole === 'admin' ? 'filled' : 'outlined'}
                onClick={() => handleRolePreset('admin')}
                icon={<i className='ri-shield-user-line' />}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label='Area Owner'
                size='small'
                clickable
                color={selectedRole === 'area_owner' ? 'primary' : 'default'}
                variant={selectedRole === 'area_owner' ? 'filled' : 'outlined'}
                onClick={() => handleRolePreset('area_owner')}
                icon={<i className='ri-community-line' />}
                sx={{ fontWeight: 600 }}
              />
              <Chip
                label='Surveyor'
                size='small'
                clickable
                color={selectedRole === 'surveyor' ? 'primary' : 'default'}
                variant={selectedRole === 'surveyor' ? 'filled' : 'outlined'}
                onClick={() => handleRolePreset('surveyor')}
                icon={<i className='ri-compass-3-line' />}
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Box>

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-4'>
            {error && (
              <Alert severity='error' sx={{ borderRadius: '8px' }}>
                {error}
              </Alert>
            )}

            <TextField
              autoFocus
              fullWidth
              label='Email atau Username'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='contoh@kanopikita.id'
            />

            <TextField
              fullWidth
              label='Kata Sandi'
              value={password}
              onChange={e => setPassword(e.target.value)}
              type={isPasswordShown ? 'text' : 'password'}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton
                        size='small'
                        edge='end'
                        onClick={handleClickShowPassword}
                        onMouseDown={e => e.preventDefault()}
                      >
                        <i className={isPasswordShown ? 'ri-eye-off-line' : 'ri-eye-line'} />
                      </IconButton>
                    </InputAdornment>
                  )
                }
              }}
            />

            <div className='flex justify-between items-center flex-wrap gap-x-3 gap-y-1'>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    sx={{ color: '#176B4D', '&.Mui-checked': { color: '#176B4D' } }}
                  />
                }
                label={<Typography variant='body2'>Ingat Saya</Typography>}
              />
              <Typography
                className='text-end'
                color='primary.main'
                component={Link}
                href='/forgot-password'
                sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#176B4D' }}
              >
                Lupa kata sandi?
              </Typography>
            </div>

            <Button
              fullWidth
              variant='contained'
              type='submit'
              size='large'
              disabled={loading}
              sx={{
                bgcolor: '#176B4D',
                color: '#ffffff',
                fontWeight: 600,
                py: 1.5,
                borderRadius: '10px',
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': { bgcolor: '#104D39' }
              }}
            >
              {loading ? 'Memproses Masuk...' : 'Masuk ke Dashboard'}
            </Button>

            <div className='flex justify-center items-center flex-wrap gap-1.5 mbs-2'>
              <Typography variant='body2' sx={{ color: '#66756D' }}>
                Belum memiliki akun pengelola kawasan?
              </Typography>
              <Typography
                component={Link}
                href='/register'
                sx={{ color: '#176B4D', fontWeight: 700, fontSize: '0.875rem' }}
              >
                Daftar akun baru
              </Typography>
            </div>

            <Divider className='gap-3 text-textPrimary mbs-2' sx={{ color: '#889890' }}>
              Sistem Keamanan
            </Divider>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 2,
                borderRadius: '8px',
                bgcolor: '#E7F3EC',
                border: '1px solid #BCE6C8'
              }}
            >
              <i className='ri-shield-check-fill' style={{ color: '#21865B', fontSize: '1.25rem' }} />
              <Typography variant='caption' sx={{ color: '#176B4D', fontWeight: 500 }}>
                Autentikasi terenkripsi JWT RSA-256 dengan proteksi brute-force & token revocation Redis.
              </Typography>
            </Box>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginV2
