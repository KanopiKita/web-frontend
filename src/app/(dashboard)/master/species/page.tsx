'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
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
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { KanopiApi } from '@/libs/apiClient'

interface SpeciesItem {
  id: string
  localName: string
  scientificName: string
  family?: string
  native: boolean
  iucnStatus?: string
  status: string
  createdAt?: string
}

const IUCN_BADGE: Record<string, { label: string; bg: string; color: string }> = {
  LC: { label: 'LC — Least Concern (Risiko Rendah)', bg: '#E7F3EC', color: '#21865B' },
  NT: { label: 'NT — Near Threatened (Hampir Terancam)', bg: '#E8F2FA', color: '#3478C0' },
  VU: { label: 'VU — Vulnerable (Rentan)', bg: '#FEF6E6', color: '#D99A25' },
  EN: { label: 'EN — Endangered (Terancam Punah)', bg: '#FDECEC', color: '#D94B4B' },
  CR: { label: 'CR — Critically Endangered (Kritis)', bg: '#FDECEC', color: '#B83838' }
}

export default function MasterSpeciesPage() {
  const [speciesList, setSpeciesList] = useState<SpeciesItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [localName, setLocalName] = useState('')
  const [scientificName, setScientificName] = useState('')
  const [family, setFamily] = useState('Dipterocarpaceae')
  const [iucnStatus, setIucnStatus] = useState('LC')
  const [native, setNative] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchSpecies = async () => {
    setLoading(true)
    try {
      const res = await KanopiApi.getMasterSpecies()
      if (Array.isArray(res)) {
        setSpeciesList(res)
      }
    } catch (err) {
      console.error('Error fetching master species:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpecies()
  }, [])

  const handleCreateSpecies = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!localName.trim() || !scientificName.trim()) return
    setSubmitting(true)
    setFeedback(null)
    try {
      await KanopiApi.createSpecies({
        local_name: localName.trim(),
        scientific_name: scientificName.trim(),
        family: family.trim() || undefined,
        native,
        iucn_status: iucnStatus
      })
      setOpenModal(false)
      setLocalName('')
      setScientificName('')
      setFeedback({
        type: 'success',
        message: `Spesies "${localName} (${scientificName})" berhasil ditambahkan ke Katalog Master Spesies!`
      })
      await fetchSpecies()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal menyimpan spesies baru.' })
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = speciesList.filter(
    s =>
      s.localName.toLowerCase().includes(search.toLowerCase()) ||
      s.scientificName.toLowerCase().includes(search.toLowerCase()) ||
      (s.family || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, maxWidth: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 320px' }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary' }}>
            Master Data Spesies Pohon & Taksonomi
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary', mt: 0.5 }}>
            Referensi taksonomi spesies pohon untuk kegiatan survei lapangan dan katalog adopsi.
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#176B4D', color: '#ffffff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
        >
          Tambah Spesies Baru
        </Button>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ borderRadius: '12px' }}>
          {feedback.message}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #DFE7E0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#E7F3EC', color: '#176B4D', display: 'flex' }}>
                <i className='ri-seedling-fill' style={{ fontSize: '1.5rem' }} />
              </Box>
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary' }}>{speciesList.length} Spesies</Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>Total Taksonomi Terdaftar</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #DFE7E0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#E8F2FA', color: '#3478C0', display: 'flex' }}>
                <i className='ri-earth-fill' style={{ fontSize: '1.5rem' }} />
              </Box>
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {speciesList.filter(s => s.native).length} Endemik / Asli
                </Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>Spesies Nusantara (Native Species)</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: '14px', border: '1px solid #DFE7E0' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box sx={{ p: 1.75, borderRadius: '12px', bgcolor: '#FEF6E6', color: '#D99A25', display: 'flex' }}>
                <i className='ri-shield-star-fill' style={{ fontSize: '1.5rem' }} />
              </Box>
              <Box>
                <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary' }}>IUCN Red List</Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>Terstandarisasi Konservasi Global</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table Card */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>Katalog Master Spesies</Typography>
                <Chip label={`${filtered.length} Spesies Terdaftar`} size='small' color='success' sx={{ fontWeight: 600 }} />
              </Box>
              <TextField
                size='small'
                placeholder='Cari nama lokal / ilmiah / famili...'
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ minWidth: 260 }}
              />
            </Box>
          }
        />
        <TableContainer>
          <Table sx={{ minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell>Nama Lokal & Ilmiah (Latin)</TableCell>
                <TableCell>Famili Botani</TableCell>
                <TableCell>Asal Ekosistem</TableCell>
                <TableCell>Status Konservasi IUCN</TableCell>
                <TableCell align='right'>Status Aktif</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align='center' sx={{ py: 6 }}>
                    <CircularProgress size={30} sx={{ color: '#176B4D', mb: 1 }} />
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>Memuat master spesies dari backend...</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map(sp => {
                  const iucn = IUCN_BADGE[sp.iucnStatus || 'LC'] || IUCN_BADGE.LC
                  return (
                    <TableRow key={sp.id} hover>
                      <TableCell>
                        <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>{sp.localName}</Typography>
                        <Typography variant='caption' sx={{ fontStyle: 'italic', color: '#176B4D', fontWeight: 600 }}>
                          {sp.scientificName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2'>{sp.family || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        {sp.native ? (
                          <Chip label='Endemik / Native' size='small' sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 600 }} />
                        ) : (
                          <Chip label='Introduksi / Non-Native' size='small' sx={{ bgcolor: '#F0F0F0', color: 'text.secondary', fontWeight: 600 }} />
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={iucn.label} size='small' sx={{ bgcolor: iucn.bg, color: iucn.color, fontWeight: 600 }} />
                      </TableCell>
                      <TableCell align='right'>
                        <Chip label='ACTIVE' size='small' color='success' variant='outlined' sx={{ fontWeight: 700 }} />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal Tambah Spesies */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth='sm' fullWidth>
        <form onSubmit={handleCreateSpecies}>
          <DialogTitle sx={{ fontWeight: 700 }}>Tambah Master Spesies Pohon Baru</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label='Nama Lokal Pohon'
              placeholder='Contoh: Bruguiera / Tanjang Merah'
              value={localName}
              onChange={e => setLocalName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label='Nama Ilmiah / Latin (Unik)'
              placeholder='Contoh: Bruguiera gymnorhiza'
              value={scientificName}
              onChange={e => setScientificName(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label='Famili Botani'
              placeholder='Contoh: Rhizophoraceae'
              value={family}
              onChange={e => setFamily(e.target.value)}
            />
            <TextField
              select
              fullWidth
              label='Status Konservasi IUCN Red List'
              value={iucnStatus}
              onChange={e => setIucnStatus(e.target.value)}
            >
              <MenuItem value='LC'>LC — Least Concern (Risiko Rendah)</MenuItem>
              <MenuItem value='NT'>NT — Near Threatened (Hampir Terancam)</MenuItem>
              <MenuItem value='VU'>VU — Vulnerable (Rentan)</MenuItem>
              <MenuItem value='EN'>EN — Endangered (Terancam Punah)</MenuItem>
              <MenuItem value='CR'>CR — Critically Endangered (Kritis)</MenuItem>
            </TextField>
            <FormControlLabel
              control={<Switch checked={native} onChange={e => setNative(e.target.checked)} color='success' />}
              label='Spesies Asli / Endemik Indonesia (Native Species)'
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModal(false)} sx={{ color: 'text.secondary' }}>Batal</Button>
            <Button
              type='submit'
              variant='contained'
              disabled={submitting}
              sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600 }}
            >
              {submitting ? 'Menyimpan...' : 'Simpan Spesies'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
