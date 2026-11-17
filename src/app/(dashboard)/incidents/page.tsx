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

interface IncidentItem {
  id: string
  ticketCode: string
  treeId: string
  treeUuid: string
  area: string
  reportedBy: string
  reportDate: string
  incidentType: string
  severity: string
  triageStatus: string
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<IncidentItem[]>([])
  const [trees, setTrees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openCreate, setOpenCreate] = useState(false)
  const [selectedIncident, setSelectedIncident] = useState<IncidentItem | null>(null)
  const [treeUuid, setTreeUuid] = useState('')
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('high')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchIncidentsData = async () => {
    setLoading(true)
    try {
      const [incRes, treeRes] = await Promise.all([
        KanopiApi.getAdminIncidents().catch(() => []),
        KanopiApi.getPublicTrees().catch(() => [])
      ])

      if (Array.isArray(treeRes) && treeRes.length > 0) {
        setTrees(treeRes)
        setTreeUuid(treeRes[0].id)
      }

      if (Array.isArray(incRes)) {
        const mapped: IncidentItem[] = incRes.map((inc: any, idx: number) => ({
          id: inc.id,
          ticketCode: `INC-2026-00${idx + 1}`,
          treeId: inc.tree?.treeCode || 'KNP-MRG-003',
          treeUuid: inc.treeId,
          area: inc.tree?.area?.name || 'Kawasan Restorasi Mangrove Muara Gembong',
          reportedBy: `${inc.reporter?.name || 'Petugas'} (${inc.source || 'surveyor'})`,
          reportDate: inc.createdAt
            ? new Date(inc.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
            : '17 Nov 2026',
          incidentType: inc.description,
          severity: inc.severity || 'medium',
          triageStatus: inc.status || 'REPORTED'
        }))
        setIncidents(mapped)
      }
    } catch (err) {
      console.error('Error fetching incidents:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIncidentsData()
  }, [])

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!treeUuid || description.trim().length < 5) return
    setSubmitting(true)
    setFeedback(null)
    try {
      await KanopiApi.reportIncident({
        tree_id: treeUuid,
        severity,
        description: description.trim()
      })
      setOpenCreate(false)
      setDescription('')
      setFeedback({ type: 'success', message: 'Laporan insiden pohon berhasil disimpan!' })
      await fetchIncidentsData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal melaporkan insiden.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleResolveTriage = (statusLabel: string) => {
    if (!selectedIncident) return
    setIncidents(prev => prev.map(i => (i.id === selectedIncident.id ? { ...i, triageStatus: statusLabel } : i)))
    setFeedback({
      type: 'success',
      message: `Tiket ${selectedIncident.ticketCode} (${selectedIncident.treeId}) berhasil diperbarui ke status ${statusLabel}.`
    })
    setSelectedIncident(null)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary' }}>
            Triage Insiden & Penggantian Pohon
          </Typography>
          <Typography variant='body2' sx={{ color: 'text.secondary' }}>
            Penanganan laporan pohon sakit/tumbang, penugasan inspeksi surveyor, dan alokasi pergantian pohon.
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          onClick={() => setOpenCreate(true)}
          sx={{ bgcolor: '#D94B4B', color: '#ffffff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#B83838' } }}
        >
          Input Laporan Insiden Baru
        </Button>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ borderRadius: '12px' }}>
          {feedback.message}
        </Alert>
      )}

      {/* Incidents Table */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Tiket Insiden Aktif</Typography>
              <Chip label={`${incidents.length} Tiket Aktif`} size='small' color='error' sx={{ fontWeight: 600 }} />
            </Box>
          }
        />
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: 'action.hover' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID Tiket & Tanggal</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Pohon & Kawasan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Deskripsi Insiden</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Pelapor & Tingkat</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status Triage</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600 }}>Tindakan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#176B4D', mb: 1 }} />
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>Memuat data insiden dari backend...</Typography>
                  </TableCell>
                </TableRow>
              ) : incidents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>Tidak ada tiket insiden aktif.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                incidents.map(inc => (
                  <TableRow key={inc.id} hover>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 700, color: '#D94B4B' }}>{inc.ticketCode}</Typography>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>{inc.reportDate}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 700, color: '#176B4D' }}>{inc.treeId}</Typography>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>{inc.area}</Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography variant='body2' sx={{ color: 'text.primary' }}>{inc.incidentType}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{inc.reportedBy}</Typography>
                      <Chip
                        label={`Severity: ${inc.severity.toUpperCase()}`}
                        size='small'
                        sx={{
                          mt: 0.5,
                          height: 20,
                          fontSize: '0.65rem',
                          bgcolor: inc.severity === 'high' || inc.severity === 'critical' ? '#FDECEC' : '#FEF6E6',
                          color: inc.severity === 'high' || inc.severity === 'critical' ? '#D94B4B' : '#D99A25',
                          fontWeight: 700
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {inc.triageStatus === 'INSPECTION_ASSIGNED' ? (
                        <Chip label='Inspeksi Ditugaskan' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
                      ) : inc.triageStatus === 'RESOLVED' ? (
                        <Chip label='Selesai Ditangani' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 600 }} />
                      ) : (
                        <Chip label='Laporan Masuk' size='small' sx={{ bgcolor: '#E8F2FA', color: '#3478C0', fontWeight: 600 }} />
                      )}
                    </TableCell>
                    <TableCell align='right'>
                      <Button
                        variant='contained'
                        size='small'
                        onClick={() => setSelectedIncident(inc)}
                        sx={{ bgcolor: '#176B4D', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
                      >
                        Proses Triage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Modal Buat Laporan Insiden Baru */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth='sm' fullWidth>
        <form onSubmit={handleCreateIncident}>
          <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>
            Input Laporan Insiden Pohon Baru
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              select
              fullWidth
              label='Pilih Pohon Terdampak'
              value={treeUuid}
              onChange={e => setTreeUuid(e.target.value)}
              required
            >
              {trees.map(t => (
                <MenuItem key={t.id} value={t.id}>
                  {t.treeCode} — {t.species?.localName || 'Mangrove'} ({t.area?.name || 'Muara Gembong'})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label='Tingkat Keparahan (Severity)'
              value={severity}
              onChange={e => setSeverity(e.target.value as any)}
            >
              <MenuItem value='low'>Low — Gangguan Ringan</MenuItem>
              <MenuItem value='medium'>Medium — Butuh Pemeliharaan</MenuItem>
              <MenuItem value='high'>High — Batang Patah / Sakit Parah</MenuItem>
              <MenuItem value='critical'>Critical — Pohon Tumbang / Mati (Perlu Penggantian)</MenuItem>
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={3}
              label='Deskripsi Kondisi & Temuan'
              placeholder='Jelaskan kondisi pohon (minimal 5 karakter)...'
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenCreate(false)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
              Batal
            </Button>
            <Button
              type='submit'
              variant='contained'
              disabled={submitting || description.trim().length < 5}
              sx={{ bgcolor: '#D94B4B', color: '#ffffff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#B83838' } }}
            >
              {submitting ? 'Mengirim...' : 'Kirim Laporan Insiden'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Triage Insiden */}
      <Dialog open={Boolean(selectedIncident)} onClose={() => setSelectedIncident(null)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: 'text.primary' }}>
          Keputusan Triage Insiden Pohon
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedIncident && (
            <>
              <Box sx={{ p: 2, bgcolor: '#FDECEC', borderRadius: '8px' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#D94B4B' }}>
                  {selectedIncident.ticketCode} • Pohon {selectedIncident.treeId}
                </Typography>
                <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                  Lokasi: {selectedIncident.area} • Pelapor: {selectedIncident.reportedBy}
                </Typography>
              </Box>
              <Typography variant='body2' sx={{ color: 'text.primary' }}>
                <strong>Temuan Masalah:</strong> {selectedIncident.incidentType}
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setSelectedIncident(null)} sx={{ textTransform: 'none', color: 'text.secondary' }}>
            Tutup
          </Button>
          <Button
            variant='outlined'
            onClick={() => handleResolveTriage('INSPECTION_ASSIGNED')}
            sx={{ borderColor: '#D99A25', color: '#D99A25', textTransform: 'none', fontWeight: 600 }}
          >
            Tugaskan Inspeksi Surveyor
          </Button>
          <Button
            variant='contained'
            onClick={() => handleResolveTriage('RESOLVED')}
            sx={{ bgcolor: '#176B4D', color: '#ffffff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
          >
            Tandai Selesai Ditangani
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
