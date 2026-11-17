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
  const [surveys, setSurveys] = useState<SurveySubmissionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<SurveySubmissionItem | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchQueue = async () => {
    setLoading(true)
    try {
      const res = await KanopiApi.getReviewQueue()
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
    fetchQueue()
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Batch Hasil Survei Lapangan (Review Queue)
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Sinkronisasi data batch dari aplikasi mobile surveyor (`/v1/admin/review-queue`) dan persetujuan hasil verifikasi lapangan.
          </Typography>
        </Box>
        <Button
          variant='outlined'
          startIcon={<i className='ri-refresh-line' />}
          onClick={fetchQueue}
          sx={{ borderColor: '#176B4D', color: '#176B4D', textTransform: 'none', fontWeight: 600 }}
        >
          Muat Ulang Antrean
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
              <Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Pengiriman Batch Survei</Typography>
              <Chip label={`${surveys.length} Submission Live BE`} size='small' color='success' sx={{ fontWeight: 600 }} />
            </Box>
          }
        />
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F7F9F7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Batch ID & Tanggal</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Kawasan & Kode Tugas</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Surveyor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cakupan Pohon</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status Review</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600 }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#176B4D', mb: 1 }} />
                    <Typography variant='body2' sx={{ color: '#66756D' }}>Memuat antrean review survei dari backend...</Typography>
                  </TableCell>
                </TableRow>
              ) : surveys.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <Typography variant='body2' sx={{ color: '#66756D' }}>Seluruh submission survei telah selesai ditinjau.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                surveys.map(item => (
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
                        sx={{ borderColor: '#176B4D', color: '#176B4D', textTransform: 'none', fontWeight: 600 }}
                      >
                        Detail & Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

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
          <Button onClick={() => setSelectedBatch(null)} sx={{ textTransform: 'none', color: '#66756D' }}>
            Batal
          </Button>
          <Button
            variant='outlined'
            disabled={submitting}
            onClick={() => handleReviewDecision('REVISION_REQUIRED')}
            sx={{ borderColor: '#D94B4B', color: '#D94B4B', textTransform: 'none' }}
          >
            Minta Revisi
          </Button>
          <Button
            variant='contained'
            disabled={submitting}
            onClick={() => handleReviewDecision('APPROVED')}
            sx={{ bgcolor: '#176B4D', color: '#ffffff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
          >
            {submitting ? 'Menyimpan...' : 'Setujui Batch'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
