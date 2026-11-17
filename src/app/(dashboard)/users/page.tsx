'use client'

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

export default function UsersPage() {
  const users = [
    {
      id: 'USR-001',
      name: 'Lembaga Pengelola Hutan Adat (LPHA) Merangin',
      email: 'admin@lpha-merangin.org',
      role: 'AREA_OWNER',
      organization: 'LPHA Merangin',
      verificationStatus: 'VERIFIED',
      joinedDate: '12 Jan 2026'
    },
    {
      id: 'USR-002',
      name: 'Budi Hartono',
      email: 'budi.hartono@surveyor.kanopi.org',
      role: 'SURVEYOR',
      organization: 'Tim Survei Jambi',
      verificationStatus: 'VERIFIED',
      joinedDate: '15 Feb 2026'
    },
    {
      id: 'USR-003',
      name: 'Yayasan Konservasi Borneo',
      email: 'contact@borneokonservasi.id',
      role: 'AREA_OWNER',
      organization: 'Yayasan Borneo',
      verificationStatus: 'VERIFIED',
      joinedDate: '01 Mar 2026'
    },
    {
      id: 'USR-004',
      name: 'Kasepuhan Adat Ciptagelar',
      email: 'ciptagelar.hutan@gmail.com',
      role: 'AREA_OWNER',
      organization: 'Masyarakat Adat Ciptagelar',
      verificationStatus: 'PENDING_APPROVAL',
      joinedDate: '14 Nov 2026'
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Manajemen Pengguna & Organisasi
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Verifikasi akun pemilik kawasan (Area Owner), penugasan tugas surveyor lapangan, dan pengelolaan hak akses (*RBAC*).
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
        <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Akun Pengguna Terdaftar</Typography>} />
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
              {users.map(u => (
                <TableRow key={u.id} hover>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E' }}>{u.name}</Typography>
                    <Typography variant='caption' sx={{ color: '#176B4D', fontWeight: 600 }}>{u.id}</Typography>
                  </TableCell>
                  <TableCell><Typography variant='body2'>{u.email}</Typography></TableCell>
                  <TableCell>
                    <Chip
                      label={u.role === 'AREA_OWNER' ? 'Area Owner' : 'Surveyor'}
                      size='small'
                      sx={{ bgcolor: u.role === 'AREA_OWNER' ? '#E8F2FA' : '#FEF6E6', color: u.role === 'AREA_OWNER' ? '#3478C0' : '#D99A25', fontWeight: 600 }}
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
