'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { KanopiApi } from '@/libs/apiClient'

interface UserItem {
  rawId: string
  id: string
  name: string
  email: string
  role: string
  organization: string
  verificationStatus: string
  joinedDate?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [openInvite, setOpenInvite] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newPassword, setNewPassword] = useState('Password123!')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await KanopiApi.getUsers()
      if (res && Array.isArray(res) && res.length > 0) {
        const mapped: UserItem[] = res.map((u: any, idx: number) => {
          const membership = u.memberships?.[0]
          const roleCode = membership?.role?.code || 'ADOPTER'
          const orgName = membership?.organization?.name || 'Yayasan Kanopi Kita Indonesia'
          return {
            rawId: u.id,
            id: u.id ? `USR-${u.id.substring(0, 8)}` : `USR-00${idx + 1}`,
            name: u.name,
            email: u.email,
            role: roleCode,
            organization: orgName,
            verificationStatus: u.platformVerification || 'VERIFIED',
            joinedDate: u.createdAt
              ? new Date(u.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
              : '16 Nov 2026'
          }
        })
        setUsers(mapped)
      } else {
        setUsers([])
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) return
    setSubmitting(true)
    setFeedback(null)
    try {
      await KanopiApi.createUser({
        name: newName.trim(),
        email: newEmail.trim(),
        password: newPassword,
        phone: newPhone.trim() || undefined
      })
      setOpenInvite(false)
      setNewName('')
      setNewEmail('')
      setNewPhone('')
      setFeedback({ type: 'success', message: `Pengguna baru (${newEmail}) berhasil ditambahkan!` })
      await fetchUsers()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal membuat pengguna baru.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyUser = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!selectedUser) return
    setSubmitting(true)
    try {
      await KanopiApi.verifyUser(selectedUser.rawId, status)
      setFeedback({
        type: 'success',
        message: `Status verifikasi akun ${selectedUser.name} berhasil diubah menjadi ${status}.`
      })
      setSelectedUser(null)
      await fetchUsers()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal memperbarui status verifikasi pengguna.' })
    } finally {
      setSubmitting(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPERADMIN':
        return { bg: '#FDECEC', color: '#D94B4B' }
      case 'AREA_OWNER':
        return { bg: '#E8F2FA', color: '#3478C0' }
      case 'SURVEYOR':
        return { bg: '#FEF6E6', color: '#D99A25' }
      case 'ADOPTER':
        return { bg: '#E7F3EC', color: '#21865B' }
      default:
        return { bg: '#F0F0F0', color: 'text.secondary' }
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary' }}>
            Manajemen Pengguna & Organisasi
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Verifikasi akun pemilik kawasan (Area Owner), penugasan surveyor lapangan, dan pengelolaan hak akses (*RBAC*).
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-user-add-line' />}
          onClick={() => setOpenInvite(true)}
          sx={{ bgcolor: '#176B4D', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
        >
          Undang Pengguna Baru
        </Button>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ borderRadius: '12px' }}>
          {feedback.message}
        </Alert>
      )}

      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Akun Pengguna Terdaftar</Typography>
              <Chip label={`${users.length} Akun Terdaftar`} size='small' color='success' sx={{ fontWeight: 600 }} />
            </Box>
          }
        />
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Nama Pengguna / Org</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email Kontak</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Peran (Role)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Organisasi</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status Verifikasi</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600 }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#176B4D', mb: 1 }} />
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>Memuat akun pengguna dari backend...</Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>Tidak ada data akun dari backend.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map(u => {
                  const roleStyle = getRoleColor(u.role)
                  return (
                    <TableRow key={u.rawId} hover>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>{u.name}</Typography>
                        <Typography variant='caption' sx={{ color: '#176B4D', fontWeight: 600 }}>{u.id}</Typography>
                      </TableCell>
                      <TableCell><Typography variant='body2'>{u.email}</Typography></TableCell>
                      <TableCell>
                        <Chip
                          label={u.role}
                          size='small'
                          sx={{ bgcolor: roleStyle.bg, color: roleStyle.color, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell><Typography variant='body2'>{u.organization}</Typography></TableCell>
                      <TableCell>
                        {u.verificationStatus === 'VERIFIED' ? (
                          <Chip label='Terverifikasi' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 600 }} />
                        ) : u.verificationStatus === 'REJECTED' ? (
                          <Chip label='Ditolak' size='small' sx={{ bgcolor: '#FDECEC', color: '#D94B4B', fontWeight: 600 }} />
                        ) : (
                          <Chip label='Menunggu Persetujuan' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
                        )}
                      </TableCell>
                      <TableCell align='right'>
                        <Button
                          variant='outlined'
                          size='small'
                          onClick={() => setSelectedUser(u)}
                          sx={{ borderColor: '#176B4D', color: '#176B4D', textTransform: 'none', fontWeight: 600 }}
                        >
                          Kelola Izin
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal Undang Pengguna Baru */}
      <Dialog open={openInvite} onClose={() => setOpenInvite(false)} maxWidth='sm' fullWidth>
        <form onSubmit={handleInviteUser}>
          <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>
            Undang Pengguna Baru ke Platform
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label='Nama Lengkap Pengguna'
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder='Contoh: Rina Kusuma (Surveyor)'
              required
            />
            <TextField
              fullWidth
              type='email'
              label='Alamat Email Resmi'
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder='rina@kanopikita.id'
              required
            />
            <TextField
              fullWidth
              label='Nomor Telepon (Opsional)'
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              placeholder='+628123456789'
            />
            <TextField
              fullWidth
              label='Kata Sandi Awal'
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenInvite(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
              Batal
            </Button>
            <Button
              type='submit'
              variant='contained'
              disabled={submitting}
              sx={{ bgcolor: '#176B4D', color: '#ffffff', textTransform: 'none', fontWeight: 600 }}
            >
              {submitting ? 'Menyimpan...' : 'Buat Akun Pengguna'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Kelola Izin & Verifikasi */}
      <Dialog open={Boolean(selectedUser)} onClose={() => setSelectedUser(null)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>
          Kelola Verifikasi & Hak Akses Akun
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedUser && (
            <>
              <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: '8px' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#176B4D' }}>
                  {selectedUser.name}
                </Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                  Email: {selectedUser.email} • Role: {selectedUser.role}
                </Typography>
              </Box>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                Organisasi Terdaftar: <strong>{selectedUser.organization}</strong>
              </Typography>
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                Status Verifikasi Saat Ini: <strong>{selectedUser.verificationStatus}</strong>
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setSelectedUser(null)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Tutup
          </Button>
          <Button
            variant='outlined'
            color='error'
            disabled={submitting}
            onClick={() => handleVerifyUser('REJECTED')}
            sx={{ textTransform: 'none' }}
          >
            Tangguhkan / Tolak
          </Button>
          <Button
            variant='contained'
            disabled={submitting}
            onClick={() => handleVerifyUser('VERIFIED')}
            sx={{ bgcolor: '#176B4D', color: '#ffffff', textTransform: 'none', fontWeight: 600 }}
          >
            Setujui Verifikasi (VERIFIED)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
