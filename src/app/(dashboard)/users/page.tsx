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
import CircularProgress from '@mui/material/CircularProgress'
import { KanopiApi } from '@/libs/apiClient'

interface UserItem {
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

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const res = await KanopiApi.getUsers()
        if (res && Array.isArray(res) && res.length > 0) {
          const mapped: UserItem[] = res.map((u: any, idx: number) => {
            const membership = u.memberships?.[0]
            const roleCode = membership?.role?.code || 'USER'
            const orgName = membership?.organization?.name || 'Yayasan Kanopi Kita Indonesia'
            return {
              id: u.id ? `USR-${u.id.substring(0, 8)}` : `USR-00${idx + 1}`,
              name: u.name,
              email: u.email,
              role: roleCode,
              organization: orgName,
              verificationStatus: u.platformVerification || 'VERIFIED',
              joinedDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '16 Nov 2026'
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

    fetchUsers()
  }, [])

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
        return { bg: '#F0F0F0', color: '#66756D' }
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Manajemen Pengguna & Organisasi
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Verifikasi akun pemilik kawasan (Area Owner), penugasan tugas surveyor lapangan, dan pengelolaan hak akses (*RBAC*) terintegrasi Backend.
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-user-add-line' />}
          sx={{ bgcolor: '#176B4D', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
        >
          Undang Pengguna Baru
        </Button>
      </Box>

      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Akun Pengguna Terdaftar</Typography>
              <Chip label={`${users.length} Akun Live BE`} size='small' color='success' sx={{ fontWeight: 600 }} />
            </Box>
          }
        />
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F7F9F7' }}>
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
                    <Typography variant='body2' sx={{ color: '#66756D' }}>Memuat akun pengguna dari backend...</Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <Typography variant='body2' sx={{ color: '#66756D' }}>Tidak ada data akun dari backend.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map(u => {
                  const roleStyle = getRoleColor(u.role)
                  return (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E' }}>{u.name}</Typography>
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
                        ) : (
                          <Chip label='Menunggu Persetujuan' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
                        )}
                      </TableCell>
                      <TableCell align='right'>
                        <Button variant='outlined' size='small' sx={{ borderColor: '#176B4D', color: '#176B4D', textTransform: 'none' }}>
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
    </Box>
  )
}
