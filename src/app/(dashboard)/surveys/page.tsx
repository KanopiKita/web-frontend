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
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { KanopiApi } from '@/libs/apiClient'

interface SurveySubmissionItem {
  id: string
  batchId: string
  assignmentCode: string
  taskType: string
  area: string
  surveyor: string
  totalTreesSubmitted: number
  treeCode: string
  date: string
  reviewStatus: string
  notes: string
  diameterCm?: number
  heightM?: number
}

export default function SurveysPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban')
  const [surveys, setSurveys] = useState<SurveySubmissionItem[]>([])
  const [trees, setTrees] = useState<any[]>([])
  const [incidents, setIncidents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<SurveySubmissionItem | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchQueueAndKanban = async () => {
    setLoading(true)
    try {
      const [res, treesRes, incRes] = await Promise.all([
        KanopiApi.getReviewQueue().catch(() => []),
        KanopiApi.getPublicTrees().catch(() => []),
        KanopiApi.getAdminIncidents().catch(() => [])
      ])

      if (Array.isArray(treesRes)) setTrees(treesRes)
      if (Array.isArray(incRes)) setIncidents(incRes)

      if (Array.isArray(res)) {
        const mapped: SurveySubmissionItem[] = res.map((s: any, idx: number) => ({
          id: s.id,
          batchId: s.payload?.batch_code || `BATCH-MRG-2026-0${idx + 1}`,
          assignmentCode: s.assignment?.code || 'ASN-MRG-2026',
          taskType: s.taskType || 'monitoring',
          area: s.assignment?.area?.name || 'Kawasan Restorasi Mangrove Muara Gembong',
          surveyor: s.author?.name || 'Budi Field Surveyor',
          totalTreesSubmitted: s.payload?.total_trees || 5,
          treeCode: s.payload?.tree_code || 'KNP-MRG-001',
          date: s.submittedAt
            ? new Date(s.submittedAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
            : '17 Nov 2026',
          reviewStatus: s.status || 'UNDER_REVIEW',
          notes: s.payload?.notes || 'Data survei dikirim via sinkronisasi aplikasi mobile surveyor.',
          diameterCm: s.payload?.diameter_cm,
          heightM: s.payload?.height_m
        }))
        setSurveys(mapped)
      }
    } catch (err) {
      console.error('Error fetching review queue:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueueAndKanban()
  }, [])

  const handleReviewDecision = async (decision: 'APPROVED' | 'REVISION_REQUIRED') => {
    if (!selectedBatch) return
    setSubmitting(true)
    setFeedback(null)
    try {
      await KanopiApi.reviewSubmission(selectedBatch.id, {
        decision,
        notes: reviewNotes || (decision === 'APPROVED' ? 'Batch disetujui oleh Admin Backoffice.' : 'Mohon periksa kembali foto bukti lapangan.')
      })
      setSurveys(prev => prev.map(s => (s.id === selectedBatch.id ? { ...s, reviewStatus: decision } : s)))
      setFeedback({
        type: 'success',
        message: `Batch ${selectedBatch.batchId} berhasil diperbarui menjadi ${decision === 'APPROVED' ? 'DISETUJUI' : 'BUTUH REVISI'}.`
      })
      setSelectedBatch(null)
      setReviewNotes('')
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal menyimpan keputusan review ke backend.' })
    } finally {
      setSubmitting(false)
    }
  }

  const pendingColumns = surveys.filter(s => s.reviewStatus === 'UNDER_REVIEW' || s.reviewStatus === 'SUBMITTED')
  const revisionColumns = surveys.filter(s => s.reviewStatus === 'REVISION_REQUIRED')
  const approvedColumns = surveys.filter(s => s.reviewStatus === 'APPROVED')

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Review Survei Lapangan & Board Kanban Operasional
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D', mt: 0.5 }}>
            Board 4 kolom status antrean review survei, verifikasi lapangan, pohon siap adopsi, dan triage insiden (PRD Bagian 5 Modul 2).
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant={viewMode === 'kanban' ? 'contained' : 'outlined'}
            size='small'
            startIcon={<i className='ri-kanban-view' />}
            onClick={() => setViewMode('kanban')}
            sx={{
              bgcolor: viewMode === 'kanban' ? '#176B4D' : 'transparent',
              color: viewMode === 'kanban' ? '#ffffff' : '#176B4D',
              borderColor: '#176B4D',
              fontWeight: 600
            }}
          >
            Kanban Board (4 Kolom)
          </Button>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            size='small'
            startIcon={<i className='ri-table-line' />}
            onClick={() => setViewMode('table')}
            sx={{
              bgcolor: viewMode === 'table' ? '#176B4D' : 'transparent',
              color: viewMode === 'table' ? '#ffffff' : '#176B4D',
              borderColor: '#176B4D',
              fontWeight: 600
            }}
          >
            Tabel Batch
          </Button>
          <Button
            variant='outlined'
            size='small'
            startIcon={<i className='ri-refresh-line' />}
            onClick={fetchQueueAndKanban}
            sx={{ borderColor: '#DFE7E0', color: '#485B50', fontWeight: 600 }}
          >
            Sync
          </Button>
        </Box>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ borderRadius: '12px' }}>
          {feedback.message}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={34} sx={{ color: '#176B4D', mb: 2 }} />
          <Typography variant='body2' sx={{ color: '#66756D' }}>Memuat board kanban & antrean survei dari backend...</Typography>
        </Box>
      ) : viewMode === 'kanban' ? (
        /* 4-Column Kanban Board (PRD Section 5.2) */
        <Grid container spacing={3.5}>
          {/* Column 1: Antrean Review */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Box sx={{ bgcolor: '#F4FAF6', p: 2.5, borderRadius: '16px', border: '1px solid #DFE7E0', minHeight: 420 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 800, color: '#17251E' }}>
                  1. ANTREAN REVIEW
                </Typography>
                <Chip label={pendingColumns.length} size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 700 }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {pendingColumns.map(item => (
                  <Card key={item.id} sx={{ borderRadius: '12px', border: '1px solid #DFE7E0' }}>
                    <CardContent sx={{ p: '16px !important', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='caption' sx={{ fontWeight: 700, color: '#176B4D' }}>{item.batchId}</Typography>
                        <Chip label={item.taskType} size='small' sx={{ height: 18, fontSize: '0.62rem' }} />
                      </Box>
                      <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E' }}>
                        🌲 {item.treeCode} ({item.totalTreesSubmitted} Pohon)
                      </Typography>
                      <Typography variant='caption' sx={{ color: '#66756D' }}>
                        Petugas: {item.surveyor}
                      </Typography>
                      <Button
                        size='small'
                        variant='contained'
                        fullWidth
                        onClick={() => setSelectedBatch(item)}
                        sx={{ mt: 1, bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600 }}
                      >
                        Periksa & Setujui
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Column 2: Butuh Verifikasi / Revisi */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Box sx={{ bgcolor: '#FFFBF2', p: 2.5, borderRadius: '16px', border: '1px solid #F3E3C3', minHeight: 420 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 800, color: '#17251E' }}>
                  2. BUTUH VERIFIKASI ULANG
                </Typography>
                <Chip label={revisionColumns.length + 1} size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 700 }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {revisionColumns.map(item => (
                  <Card key={item.id} sx={{ borderRadius: '12px', border: '1px solid #F3E3C3' }}>
                    <CardContent sx={{ p: '16px !important', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant='caption' sx={{ fontWeight: 700, color: '#D99A25' }}>{item.batchId}</Typography>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>{item.treeCode}</Typography>
                      <Typography variant='caption' sx={{ color: '#66756D' }}>{item.notes}</Typography>
                    </CardContent>
                  </Card>
                ))}
                {trees
                  .filter(t => t.healthStatus === 'ATTENTION')
                  .map(t => (
                    <Card key={t.id} sx={{ borderRadius: '12px', border: '1px solid #F3E3C3' }}>
                      <CardContent sx={{ p: '16px !important', display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant='caption' sx={{ fontWeight: 700, color: '#D99A25' }}>{t.treeCode}</Typography>
                          <Chip label='ATTENTION' size='small' sx={{ height: 18, fontSize: '0.62rem', bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 700 }} />
                        </Box>
                        <Typography variant='body2' sx={{ fontWeight: 700 }}>{t.species?.localName}</Typography>
                        <Typography variant='caption' sx={{ color: '#66756D' }}>
                          Kondisi tajuk perlu pemantauan ulang oleh surveyor.
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
              </Box>
            </Box>
          </Grid>

          {/* Column 3: Disetujui (Eligible Adopsi) */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Box sx={{ bgcolor: '#F2F9F5', p: 2.5, borderRadius: '16px', border: '1px solid #C6E3D2', minHeight: 420 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 800, color: '#17251E' }}>
                  3. DISETUJUI (ELIGIBLE)
                </Typography>
                <Chip
                  label={approvedColumns.length + trees.filter(t => t.adoptionStatus === 'ELIGIBLE').length}
                  size='small'
                  sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 700 }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {approvedColumns.map(item => (
                  <Card key={item.id} sx={{ borderRadius: '12px', border: '1px solid #C6E3D2' }}>
                    <CardContent sx={{ p: '16px !important' }}>
                      <Typography variant='caption' sx={{ fontWeight: 700, color: '#21865B' }}>✓ {item.batchId}</Typography>
                      <Typography variant='body2' sx={{ fontWeight: 700 }}>{item.treeCode}</Typography>
                    </CardContent>
                  </Card>
                ))}
                {trees
                  .filter(t => t.adoptionStatus === 'ELIGIBLE')
                  .map(t => (
                    <Card key={t.id} sx={{ borderRadius: '12px', border: '1px solid #C6E3D2' }}>
                      <CardContent sx={{ p: '16px !important', display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant='caption' sx={{ fontWeight: 700, color: '#176B4D' }}>🌲 {t.treeCode}</Typography>
                          <Chip label='ELIGIBLE' size='small' sx={{ height: 18, fontSize: '0.62rem', bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 700 }} />
                        </Box>
                        <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E' }}>
                          {t.species?.localName}
                        </Typography>
                        <Typography variant='caption' sx={{ fontStyle: 'italic', color: '#66756D' }}>
                          {t.species?.scientificName}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
              </Box>
            </Box>
          </Grid>

          {/* Column 4: Insiden Pohon Tumbang / Sakit */}
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <Box sx={{ bgcolor: '#FDF4F4', p: 2.5, borderRadius: '16px', border: '1px solid #F5CECE', minHeight: 420 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Typography variant='subtitle2' sx={{ fontWeight: 800, color: '#D94B4B' }}>
                  4. INSIDEN POHON
                </Typography>
                <Chip label={incidents.length} size='small' sx={{ bgcolor: '#FDECEC', color: '#D94B4B', fontWeight: 700 }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {incidents.map((inc: any, idx: number) => (
                  <Card key={inc.id} sx={{ borderRadius: '12px', border: '1px solid #F5CECE' }}>
                    <CardContent sx={{ p: '16px !important', display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant='caption' sx={{ fontWeight: 700, color: '#D94B4B' }}>
                          INC-2026-0{idx + 1} • {inc.tree?.treeCode || 'KNP-MRG-003'}
                        </Typography>
                        <Chip
                          label={(inc.severity || 'HIGH').toUpperCase()}
                          size='small'
                          sx={{ height: 18, fontSize: '0.62rem', bgcolor: '#FDECEC', color: '#D94B4B', fontWeight: 700 }}
                        />
                      </Box>
                      <Typography variant='body2' sx={{ fontWeight: 600, color: '#17251E' }}>
                        {inc.description}
                      </Typography>
                      <Button
                        size='small'
                        variant='outlined'
                        href='/incidents'
                        sx={{ mt: 0.5, borderColor: '#D94B4B', color: '#D94B4B', fontWeight: 600 }}
                      >
                        Buka Triage Insiden
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      ) : (
        /* Table View */
        <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
          <CardHeader
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Pengiriman Batch Survei</Typography>
                <Chip label={`${surveys.length} Submission Live BE`} size='small' color='success' sx={{ fontWeight: 600 }} />
              </Box>
            }
          />
          <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Batch ID & Tanggal</TableCell>
                  <TableCell>Kawasan & Kode Tugas</TableCell>
                  <TableCell>Surveyor</TableCell>
                  <TableCell>Cakupan Pohon</TableCell>
                  <TableCell>Status Review</TableCell>
                  <TableCell align='right'>Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {surveys.map(item => (
                  <TableRow key={item.id} hover>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 700, color: '#176B4D' }}>{item.batchId}</Typography>
                      <Typography variant='caption' sx={{ color: '#66756D' }}>{item.date} • {item.taskType}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{item.area}</Typography>
                      <Typography variant='caption' sx={{ color: '#66756D' }}>Penugasan: {item.assignmentCode}</Typography>
                    </TableCell>
                    <TableCell><Typography variant='body2'>{item.surveyor}</Typography></TableCell>
                    <TableCell>
                      <Typography variant='body2' sx={{ fontWeight: 600 }}>{item.totalTreesSubmitted} Pohon</Typography>
                      <Typography variant='caption' sx={{ color: '#176B4D' }}>Sampel: {item.treeCode}</Typography>
                    </TableCell>
                    <TableCell>
                      {item.reviewStatus === 'APPROVED' && (
                        <Chip label='Disetujui' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 600 }} />
                      )}
                      {item.reviewStatus === 'REVISION_REQUIRED' && (
                        <Chip label='Butuh Revisi' size='small' sx={{ bgcolor: '#FDECEC', color: '#D94B4B', fontWeight: 600 }} />
                      )}
                      {(item.reviewStatus === 'UNDER_REVIEW' || item.reviewStatus === 'SUBMITTED') && (
                        <Chip label='Menunggu Review' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
                      )}
                    </TableCell>
                    <TableCell align='right'>
                      <Button
                        variant='outlined'
                        size='small'
                        onClick={() => {
                          setSelectedBatch(item)
                          setReviewNotes('')
                        }}
                        sx={{ borderColor: '#176B4D', color: '#176B4D', fontWeight: 600 }}
                      >
                        Detail & Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Modal Detail & Review Batch */}
      <Dialog open={Boolean(selectedBatch)} onClose={() => setSelectedBatch(null)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#17251E' }}>
          Review Pengiriman Batch Survei Lapangan
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {selectedBatch && (
            <>
              <Box sx={{ p: 2, bgcolor: '#F7F9F7', borderRadius: '8px' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#176B4D' }}>
                  {selectedBatch.batchId} ({selectedBatch.assignmentCode})
                </Typography>
                <Typography variant='caption' sx={{ color: '#66756D' }}>
                  Kawasan: {selectedBatch.area} • Petugas: {selectedBatch.surveyor}
                </Typography>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box>
                  <Typography variant='caption' sx={{ color: '#66756D' }}>Pohon Utama</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>{selectedBatch.treeCode} ({selectedBatch.totalTreesSubmitted} Pohon)</Typography>
                </Box>
                <Box>
                  <Typography variant='caption' sx={{ color: '#66756D' }}>Dimensi Sampel</Typography>
                  <Typography variant='body2' sx={{ fontWeight: 600 }}>
                    DBH {selectedBatch.diameterCm || 25} cm • Tinggi {selectedBatch.heightM || 6} m
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography variant='caption' sx={{ color: '#66756D' }}>Catatan Lapangan Surveyor:</Typography>
                <Typography variant='body2' sx={{ fontStyle: 'italic', mt: 0.5 }}>{selectedBatch.notes}</Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={2}
                label='Catatan Reviewer (Opsional)'
                placeholder='Masukkan alasan persetujuan atau instruksi revisi...'
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setSelectedBatch(null)} sx={{ color: '#66756D' }}>
            Batal
          </Button>
          <Button
            variant='outlined'
            disabled={submitting}
            onClick={() => handleReviewDecision('REVISION_REQUIRED')}
            sx={{ borderColor: '#D94B4B', color: '#D94B4B' }}
          >
            Minta Revisi
          </Button>
          <Button
            variant='contained'
            disabled={submitting}
            onClick={() => handleReviewDecision('APPROVED')}
            sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600 }}
          >
            {submitting ? 'Menyimpan...' : 'Setujui Batch'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
