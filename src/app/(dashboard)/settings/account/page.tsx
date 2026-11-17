'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { KanopiApi } from '@/libs/apiClient'

const DEMO_ACCOUNTS = [
  { role: 'SUPERADMIN', label: 'Super Admin Platform', email: 'admin@kanopikita.id', color: '#D94B4B' },
  { role: 'AREA_OWNER', label: 'Area Owner (Muara Gembong)', email: 'owner@kanopikita.id', color: '#3478C0' },
  { role: 'SURVEYOR', label: 'Surveyor Lapangan', email: 'surveyor@kanopikita.id', color: '#D99A25' },
  { role: 'ADOPTER', label: 'Adopter Publik', email: 'adopter@kanopikita.id', color: '#21865B' }
]

export default function AccountSettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [switching, setSwitching] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchMyProfile = async () => {
    setLoading(true)
    try {
      const me: any = await KanopiApi.getCurrentUser()
      if (me) {
        setProfile(me)
        setName(me.name || '')
        setPhone(me.phone || '+6281111111111')
      }
    } catch (err) {
      console.error('Error loading profile:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyProfile()
  }, [])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.id) return
    setSaving(true)
    setFeedback(null)
    try {
      await KanopiApi.updateUser(profile.id, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        ...(newPassword.trim().length >= 8 ? { password: newPassword.trim() } : {})
      })
      setNewPassword('')
      setFeedback({ type: 'success', message: 'Profil akun Anda berhasil diperbarui!' })
      await fetchMyProfile()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal menyimpan perubahan profil.' })
    } finally {
      setSaving(false)
    }
  }

  const handleQuickSwitchAccount = async (targetEmail: string, label: string) => {
    setSwitching(targetEmail)
    setFeedback(null)
    try {
      const res = await KanopiApi.login({ email: targetEmail, password: 'Password123!' })
      if (res?.access_token && typeof window !== 'undefined') {
        localStorage.setItem('access_token', res.access_token)
        localStorage.setItem('refresh_token', res.refresh_token)
        localStorage.setItem('user', JSON.stringify(res.user))
        document.cookie = `access_token=${res.access_token}; path=/; max-age=86400`
      }
      setFeedback({
        type: 'success',
        message: `Sesi aktif berhasil beralih ke akun ${label} (${targetEmail}).`
      })
      await fetchMyProfile()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal mengganti sesi akun.' })
    } finally {
      setSwitching(null)
    }
  }

  const capabilities: string[] = profile?.capabilities || [
    'system.admin',
    'area.publish',
    'tree.publish',
    'submission.review.scoped',
    'incident.triage'
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, maxWidth: '100%' }}>
      <Box>
        <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
          Kelola Akun, Profil & Hak Akses
        </Typography>
        <Typography variant='body2' sx={{ color: '#66756D', mt: 0.5 }}>
          Pengaturan informasi identitas pengguna, kata sandi, serta daftar hak akses peran Anda.
        </Typography>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ borderRadius: '12px' }}>
          {feedback.message}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 6 }}>
          <CircularProgress size={30} sx={{ color: '#176B4D' }} />
          <Typography variant='body2'>Memuat profil pengguna dari backend...</Typography>
        </Box>
      ) : (
        <Grid container spacing={5}>
          {/* Left Column: Profile Form */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0' }}>
              <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Informasi Profil Pengguna Aktif</Typography>} />
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                  <Avatar
                    src='/images/avatars/1.png'
                    sx={{ width: 68, height: 68, border: '3px solid #E7F3EC' }}
                  />
                  <Box>
                    <Typography variant='h6' sx={{ fontWeight: 700, color: '#17251E' }}>
                      {profile?.name || 'Super Admin Kanopi'}
                    </Typography>
                    <Typography variant='body2' sx={{ color: '#66756D', mb: 1 }}>
                      {profile?.email || 'admin@kanopikita.id'}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`ROLE: ${profile?.role || profile?.active_role || 'SUPERADMIN'}`}
                        size='small'
                        sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 700 }}
                      />
                      <Chip
                        label={`ORG ID: ${(profile?.org_id || '00000000-0001').substring(0, 13)}...`}
                        size='small'
                        sx={{ bgcolor: '#F0F0F0', color: '#66756D', fontWeight: 600 }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <TextField
                    fullWidth
                    label='Nama Lengkap'
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                  <TextField
                    fullWidth
                    label='Alamat Email (Read-Only Identity)'
                    value={profile?.email || ''}
                    disabled
                  />
                  <TextField
                    fullWidth
                    label='Nomor Telepon / WhatsApp'
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                  <TextField
                    fullWidth
                    type='password'
                    label='Kata Sandi Baru (Kosongkan jika tidak ingin mengubah)'
                    placeholder='Minimal 8 karakter...'
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      type='submit'
                      variant='contained'
                      disabled={saving}
                      sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600, px: 4 }}
                    >
                      {saving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
                    </Button>
                  </Box>
                </form>
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column: Role Switcher & Active Capabilities */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Quick Role Switcher */}
              <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0' }}>
                <CardHeader
                  title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Pindah Sesi Akun Cepat (Multi-Role Test)</Typography>}
                />
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Typography variant='caption' sx={{ color: '#66756D', mb: 1 }}>
                    Beralih peran untuk meninjau tampilan dashboard sesuai tingkat wewenang:
                  </Typography>
                  {DEMO_ACCOUNTS.map(acc => {
                    const isCurrent = profile?.email === acc.email
                    return (
                      <Box
                        key={acc.email}
                        sx={{
                          p: 2,
                          borderRadius: '12px',
                          border: isCurrent ? '2px solid #176B4D' : '1px solid #DFE7E0',
                          bgcolor: isCurrent ? '#F4FAF6' : '#FFFFFF',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 2
                        }}
                      >
                        <Box>
                          <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E' }}>
                            {acc.label}
                          </Typography>
                          <Typography variant='caption' sx={{ color: '#66756D' }}>
                            {acc.email} • <strong>{acc.role}</strong>
                          </Typography>
                        </Box>
                        {isCurrent ? (
                          <Chip label='Sesi Aktif' size='small' color='success' sx={{ fontWeight: 700 }} />
                        ) : (
                          <Button
                            size='small'
                            variant='outlined'
                            disabled={Boolean(switching)}
                            onClick={() => handleQuickSwitchAccount(acc.email, acc.label)}
                            sx={{ borderColor: '#176B4D', color: '#176B4D', fontWeight: 600 }}
                          >
                            {switching === acc.email ? '...' : 'Gunakan'}
                          </Button>
                        )}
                      </Box>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Capabilities List */}
              <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0' }}>
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant='h6' sx={{ fontWeight: 700 }}>Kapabilitas RBAC Aktif</Typography>
                      <Chip label={`${capabilities.length} Izin`} size='small' sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 700 }} />
                    </Box>
                  }
                />
                <CardContent>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {capabilities.map(cap => (
                      <Chip
                        key={cap}
                        label={cap}
                        size='small'
                        sx={{ bgcolor: '#F6FAF7', border: '1px solid #C6E3D2', color: '#176B4D', fontWeight: 600, fontFamily: 'monospace' }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
