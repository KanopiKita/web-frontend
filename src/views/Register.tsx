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
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { Mode } from '@core/types'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import { KanopiApi } from '@/libs/apiClient'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

const Register = ({ mode }: { mode: Mode }) => {
  // States
  const [fullName, setFullName] = useState('')
  const [organization, setOrganization] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [accountType, setAccountType] = useState('ADOPTER')
  const [password, setPassword] = useState('')
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Vars
  const darkImg = '/images/pages/auth-v2-mask-2-dark.png'
  const lightImg = '/images/pages/auth-v2-mask-2-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (password.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter.')
      return
    }

    setLoading(true)
    try {
      await KanopiApi.registerAdopter({
        name: organization ? `${fullName} (${organization})` : fullName,
        email,
        password,
        phone: phone || undefined
      })
      setSuccessMsg(true)
      setTimeout(() => {
        router.push('/login')
      }, 1500)
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mendaftarkan akun ke Backend. Pastikan email belum terdaftar.')
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
              Daftarkan Kawasan & Akun Konservasi Anda
            </Typography>
            <Typography variant='body2' sx={{ color: '#66756D', maxWidth: 440 }}>
              Bergabung dalam ekosistem konservasi digital Kanopi Kita untuk transparansi data adopsi, pemantauan kawasan, dan verifikasi pohon.
            </Typography>
          </Box>
        </div>
        <img src={authBackground} className='absolute bottom-[4%] z-[-1] is-full max-md:hidden' alt='auth-mask' />
      </div>

      {/* Right Register Form Container */}
      <div className='flex justify-center items-center bs-full min-bs-[100dvh] bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[540px] overflow-y-auto'>
        <Link href='/' className='absolute block-start-5 sm:block-start-[38px] inline-start-6 sm:inline-start-[38px]'>
          <Logo />
        </Link>

        <div className='flex flex-col gap-4 is-full sm:is-auto md:is-full sm:max-is-[440px] md:max-is-[unset] mbs-14 sm:mbs-16 md:mbs-0'>
          <div>
            <Typography variant='h4' sx={{ fontWeight: 700, color: '#17251E' }}>
              Daftar Akun Baru 🚀
            </Typography>
            <Typography className='mbs-1' sx={{ color: '#66756D' }}>
              Mulai langkah nyata pengelolaan ekosistem hijau di {themeConfig.templateName}.
            </Typography>
          </div>

          {successMsg && (
            <Alert severity='success' sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 600 }}>
              Pendaftaran berhasil! Mengalihkan Anda ke halaman login...
            </Alert>
          )}

          {errorMsg && (
            <Alert severity='error' sx={{ borderRadius: '8px' }}>
              {errorMsg}
            </Alert>
          )}

          <form noValidate autoComplete='off' onSubmit={handleSubmit} className='flex flex-col gap-3.5'>
            <TextField
              select
              fullWidth
              label='Jenis Peran Akun'
              value={accountType}
              onChange={e => setAccountType(e.target.value)}
              helperText='Pilih peran sesuai tanggung jawab Anda'
            >
              <MenuItem value='ADOPTER'>🌱 Adopter Pohon / Mitra CSR</MenuItem>
              <MenuItem value='AREA_OWNER'>🌲 Pengelola Kawasan / Lembaga Hutan Adat</MenuItem>
              <MenuItem value='SURVEYOR'>🧭 Surveyor Mandiri Lapangan</MenuItem>
            </TextField>

            <TextField
              fullWidth
              label='Nama Lengkap Penanggung Jawab'
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder='Contoh: Budi Hartono, S.Hut'
              required
            />

            <TextField
              fullWidth
              label='Nama Lembaga / Kawasan / Komunitas (Opsional)'
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              placeholder='Contoh: Yayasan Kanopi Kita Indonesia'
            />

            <TextField
              fullWidth
              label='Email Resmi'
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='nama@organisasi.or.id'
              required
            />

            <TextField
              fullWidth
              label='Nomor Telepon / WhatsApp'
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder='+6281234567890'
            />

            <TextField
              fullWidth
              label='Kata Sandi (Minimal 8 Karakter)'
              value={password}
              onChange={e => setPassword(e.target.value)}
              type={isPasswordShown ? 'text' : 'password'}
              required
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

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  sx={{ color: '#176B4D', '&.Mui-checked': { color: '#176B4D' } }}
                />
              }
              label={
                <Typography variant='caption' sx={{ color: '#66756D', lineHeight: 1.4 }}>
                  Saya menyetujui{' '}
                  <span style={{ color: '#176B4D', fontWeight: 600 }}>Syarat & Ketentuan Konservasi</span> serta{' '}
                  <span style={{ color: '#176B4D', fontWeight: 600 }}>Kebijakan Privasi Spasial</span>.
                </Typography>
              }
            />

            <Button
              fullWidth
              variant='contained'
              type='submit'
              size='large'
              disabled={!agreeTerms || loading}
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
              {loading ? 'Memproses Pendaftaran...' : 'Daftar Akun Sekarang'}
            </Button>

            <div className='flex justify-center items-center flex-wrap gap-1.5 mbs-2'>
              <Typography variant='body2' sx={{ color: '#66756D' }}>
                Sudah memiliki akun pengelola?
              </Typography>
              <Typography
                component={Link}
                href='/login'
                sx={{ color: '#176B4D', fontWeight: 700, fontSize: '0.875rem' }}
              >
                Masuk di sini
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
