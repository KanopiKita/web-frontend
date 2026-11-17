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
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { KanopiApi } from '@/libs/apiClient'

export default function MasterOrganizationsPage() {
  const [orgs, setOrgs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [name, setName] = useState('')
  const [orgType, setOrgType] = useState<'COMMUNITY' | 'NGO' | 'GOVERNMENT' | 'CORPORATE'>('COMMUNITY')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [website, setWebsite] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchOrgs = async () => {
    setLoading(true)
    try {
      const res = await KanopiApi.getOrganizations()
      if (Array.isArray(res)) {
        setOrgs(res)
      }
    } catch (err) {
      console.error('Error fetching organizations:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrgs()
  }, [])

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setFeedback(null)
    try {
      await KanopiApi.createOrganization({
        name: name.trim(),
        type: orgType,
        contact: {
          ...(email.trim() ? { email: email.trim() } : {}),
          ...(phone.trim() ? { phone: phone.trim() } : {}),
          ...(website.trim() ? { website: website.trim() } : {})
        }
      })
      setOpenModal(false)
      setName('')
      setEmail('')
      setPhone('')
      setWebsite('')
      setFeedback({ type: 'success', message: `Organisasi "${name}" berhasil didaftarkan!` })
      await fetchOrgs()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal menambahkan organisasi.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOrg = async (id: string, orgName: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await KanopiApi.verifyOrganization(id, status)
      setFeedback({ type: 'success', message: `Status organisasi "${orgName}" diperbarui menjadi ${status}.` })
      await fetchOrgs()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal memverifikasi organisasi.' })
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 320px' }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary' }}>
            Master Organisasi & Lembaga Pengelola Kawasan
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
            Manajemen yayasan konservasi, LPHA hutan adat, instansi pemerintah, dan mitra CSR korporasi.
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-building-2-line' />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600 }}
        >
          Tambah Organisasi Mitra
        </Button>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ borderRadius: '12px' }}>
          {feedback.message}
        </Alert>
      )}

      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Organisasi Terdaftar</Typography>
              <Chip label={`${orgs.length} Organisasi Terdaftar`} size='small' color='success' sx={{ fontWeight: 600 }} />
            </Box>
          }
        />
        <TableContainer>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nama Organisasi / Lembaga</TableCell>
                <TableCell>Tipe Entitas</TableCell>
                <TableCell>Kontak Resmi</TableCell>
                <TableCell>Status Verifikasi</TableCell>
                <TableCell align='right'>Aksi Verifikasi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 6 }}>
                    <CircularProgress size={30} sx={{ color: '#176B4D', mb: 1 }} />
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>Memuat daftar organisasi dari backend...</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orgs.map(org => (
                  <TableRow key={org.id} hover>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>{org.name}</Typography>
                      <Typography variant='caption' sx={{ color: '#176B4D' }}>ID: {org.id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={org.type} size='small' sx={{ bgcolor: '#E8F2FA', color: '#3478C0', fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{org.contact?.email || 'info@kanopikita.id'}</Typography>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>{org.contact?.phone || '+6281234567890'}</Typography>
                    </TableCell>
                    <TableCell>
                      {org.verifyStatus === 'VERIFIED' ? (
                        <Chip label='VERIFIED' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 700 }} />
                      ) : (
                        <Chip label={org.verifyStatus || 'PENDING'} size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 700 }} />
                      )}
                    </TableCell>
                    <TableCell align='right'>
                      {org.verifyStatus !== 'VERIFIED' ? (
                        <Button
                          size='small'
                          variant='contained'
                          onClick={() => handleVerifyOrg(org.id, org.name, 'VERIFIED')}
                          sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600 }}
                        >
                          Verifikasi
                        </Button>
                      ) : (
                        <Chip label='Terverifikasi Resmi' size='small' variant='outlined' color='success' />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal Tambah Organisasi */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth='sm' fullWidth>
        <form onSubmit={handleCreateOrg}>
          <DialogTitle sx={{ fontWeight: 700 }}>Daftarkan Organisasi / Mitra Baru</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label='Nama Resmi Organisasi / Lembaga'
              placeholder='Contoh: Lembaga Pengelola Hutan Desa Muara Gembong'
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
            <TextField
              select
              fullWidth
              label='Kategori Organisasi'
              value={orgType}
              onChange={e => setOrgType(e.target.value as any)}
            >
              <MenuItem value='COMMUNITY'>COMMUNITY — Masyarakat Adat / Kelompok Tani Hutan</MenuItem>
              <MenuItem value='NGO'>NGO — Yayasan / Lembaga Konservasi</MenuItem>
              <MenuItem value='CORPORATE'>CORPORATE — Mitra CSR Korporasi</MenuItem>
              <MenuItem value='GOVERNMENT'>GOVERNMENT — Instansi Pemerintah / UPTD</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type='email'
              label='Email Kontak Resmi'
              placeholder='kontak@organisasi.or.id'
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label='Nomor Telepon Sekretariat'
              placeholder='+628123456789'
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <TextField
              fullWidth
              label='Website Resmi (URL Lengkap)'
              placeholder='https://kanopikita.id'
              value={website}
              onChange={e => setWebsite(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)} sx={{ color: 'text.secondary' }}>Batal</Button>
            <Button type='submit' variant='contained' disabled={submitting} sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600 }}>
              {submitting ? 'Menyimpan...' : 'Simpan Organisasi'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
