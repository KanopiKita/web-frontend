'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import { KanopiApi } from '@/libs/apiClient'

interface ScheduleAssignment {
  id: string
  code: string
  date: string
  title: string
  taskType: string
  area: string
  surveyor: string
  status: string
  priority: string
  submissionsCount: number
}

const TASK_TITLES: Record<string, string> = {
  monitoring: 'Monitoring Rutin Kuartal IV — Pertumbuhan Pohon',
  tree_inspection: 'Inspeksi Kesehatan & Evaluasi Insiden Pohon',
  tree_registration: 'Inventarisasi & Registrasi Pohon Baru Lapangan'
}

export default function CalendarPage() {
  const [scheduleItems, setScheduleItems] = useState<ScheduleAssignment[]>([])
  const [areas, setAreas] = useState<any[]>([])
  const [surveyors, setSurveyors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ScheduleAssignment | null>(null)
  const [taskType, setTaskType] = useState('monitoring')
  const [areaId, setAreaId] = useState('20000000-0000-0000-0000-000000000001')
  const [assigneeId, setAssigneeId] = useState('10000000-0000-0000-0000-000000000003')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM')
  const [dueDate, setDueDate] = useState('2026-11-30')
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchAssignmentsData = async () => {
    setLoading(true)
    try {
      const [asnRes, areasRes, usersRes] = await Promise.all([
        KanopiApi.getAdminAssignments().catch(() => []),
        KanopiApi.getPublicAreas().catch(() => []),
        KanopiApi.getUsers().catch(() => [])
      ])

      if (Array.isArray(areasRes) && areasRes.length > 0) {
        setAreas(areasRes)
        setAreaId(areasRes[0].id)
      }

      if (Array.isArray(usersRes) && usersRes.length > 0) {
        const srvList = usersRes.filter((u: any) =>
          u.memberships?.some((m: any) => m.role?.code === 'SURVEYOR')
        )
        const list = srvList.length > 0 ? srvList : usersRes
        setSurveyors(list)
        if (list[0]?.id) setAssigneeId(list[0].id)
      }

      if (Array.isArray(asnRes)) {
        const mapped: ScheduleAssignment[] = asnRes.map((a: any) => ({
          id: a.id,
          code: a.code || 'ASN-MRG',
          date: a.dueAt
            ? new Date(a.dueAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
            : '25 Nov 2026',
          title: TASK_TITLES[a.type] || `Penugasan Lapangan (${a.type})`,
          taskType: a.type || 'monitoring',
          area: a.area?.name || 'Kawasan Restorasi Mangrove Muara Gembong',
          surveyor: a.assignee?.name || 'Budi Field Surveyor',
          status: a.status || 'ASSIGNED',
          priority: a.priority || 'MEDIUM',
          submissionsCount: a._count?.submissions || 0
        }))
        setScheduleItems(mapped)
      }
    } catch (err) {
      console.error('Error fetching assignments:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignmentsData()
  }, [])

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      const isoDate = new Date(`${dueDate}T09:00:00.000Z`).toISOString()
      await KanopiApi.createAssignment({
        type: taskType,
        area_id: areaId,
        assignee_id: assigneeId,
        priority,
        due_at: isoDate
      })
      setOpenModal(false)
      setFeedback({ type: 'success', message: 'Jadwal penugasan surveyor baru berhasil dibuat di Backend!' })
      await fetchAssignmentsData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal membuat penugasan baru.' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelAssignment = async (id: string, code: string) => {
    try {
      await KanopiApi.cancelAssignment(id, 'Dibatalkan melalui jadwal backoffice')
      setFeedback({ type: 'success', message: `Penugasan ${code} berhasil dibatalkan.` })
      setSelectedItem(null)
      await fetchAssignmentsData()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal membatalkan penugasan.' })
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
              Jadwal Penugasan & Monitoring Berkala
            </Typography>
            <Chip label={`${scheduleItems.length} Penugasan Live BE`} size='small' color='success' sx={{ fontWeight: 600 }} />
          </Box>
          <Typography variant='body2' sx={{ color: '#66756D', mt: 0.5 }}>
            Pengaturan jadwal pemantauan pohon teradopsi dan penugasan surveyor lapangan (`/v1/admin/assignments`).
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-calendar-event-line' />}
          onClick={() => setOpenModal(true)}
          sx={{ bgcolor: '#176B4D', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
        >
          Buat Jadwal Penugasan
        </Button>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ borderRadius: '12px' }}>
          {feedback.message}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={36} sx={{ color: '#176B4D', mb: 2 }} />
          <Typography variant='body2' sx={{ color: '#66756D' }}>Memuat jadwal penugasan dari backend...</Typography>
        </Box>
      ) : (
        <Grid container spacing={5} sx={{ width: '100%', m: 0 }}>
          {scheduleItems.map(item => (
            <Grid key={item.id} size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', height: '100%', overflow: 'hidden', maxWidth: '100%' }}>
                <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Chip
                      label={`Tenggat: ${item.date}`}
                      size='small'
                      sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 700 }}
                    />
                    <Typography variant='caption' sx={{ color: '#176B4D', fontWeight: 700 }}>{item.code}</Typography>
                  </Box>
                  <Typography variant='h6' sx={{ fontWeight: 700, color: '#17251E', mb: 1.5 }}>
                    {item.title}
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#66756D', mb: 0.5 }}>
                    Lokasi: <strong>{item.area}</strong>
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#66756D', mb: 0.5 }}>
                    Petugas: <strong>{item.surveyor}</strong>
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#66756D', mb: 2 }}>
                    Status: <strong>{item.status}</strong> ({item.submissionsCount} Laporan Masuk)
                  </Typography>
                  <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip
                      label={`Prioritas: ${item.priority}`}
                      size='small'
                      sx={{
                        bgcolor: item.priority === 'URGENT' || item.priority === 'HIGH' ? '#FDECEC' : '#F0F0F0',
                        color: item.priority === 'URGENT' || item.priority === 'HIGH' ? '#D94B4B' : '#66756D',
                        fontWeight: 600
                      }}
                    />
                    <Button
                      size='small'
                      onClick={() => setSelectedItem(item)}
                      sx={{ textTransform: 'none', color: '#176B4D', fontWeight: 600 }}
                    >
                      Detail Tugas
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal Buat Penugasan */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth='sm' fullWidth>
        <form onSubmit={handleCreateAssignment}>
          <DialogTitle sx={{ fontWeight: 700, color: '#17251E' }}>
            Buat Jadwal Penugasan Surveyor Baru
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              select
              fullWidth
              label='Jenis Tugas Lapangan'
              value={taskType}
              onChange={e => setTaskType(e.target.value)}
            >
              <MenuItem value='monitoring'>Monitoring Berkala (Pertumbuhan & Biomassa)</MenuItem>
              <MenuItem value='tree_inspection'>Inspeksi Kesehatan & Triage Pohon</MenuItem>
              <MenuItem value='tree_registration'>Registrasi & Tagging Pohon Baru</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              label='Kawasan Konservasi'
              value={areaId}
              onChange={e => setAreaId(e.target.value)}
            >
              {areas.map(a => (
                <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label='Petugas Surveyor'
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
            >
              {surveyors.map(u => (
                <MenuItem key={u.id} value={u.id}>{u.name} ({u.email})</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              label='Tingkat Prioritas'
              value={priority}
              onChange={e => setPriority(e.target.value as any)}
            >
              <MenuItem value='LOW'>LOW — Rutin</MenuItem>
              <MenuItem value='MEDIUM'>MEDIUM — Standar Operasional</MenuItem>
              <MenuItem value='HIGH'>HIGH — Penting</MenuItem>
              <MenuItem value='URGENT'>URGENT — Darurat Insiden</MenuItem>
            </TextField>

            <TextField
              fullWidth
              type='date'
              label='Tenggat Waktu (Due Date)'
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ textTransform: 'none', color: '#66756D' }}>
              Batal
            </Button>
            <Button
              type='submit'
              variant='contained'
              disabled={submitting}
              sx={{ bgcolor: '#176B4D', color: '#ffffff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
            >
              {submitting ? 'Menyimpan...' : 'Simpan & Tugaskan'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Detail Penugasan */}
      <Dialog open={Boolean(selectedItem)} onClose={() => setSelectedItem(null)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: '#17251E' }}>
          Detail Penugasan Lapangan
        </DialogTitle>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {selectedItem && (
            <>
              <Box sx={{ p: 2, bgcolor: '#F7F9F7', borderRadius: '8px' }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 700, color: '#176B4D' }}>
                  {selectedItem.code} — {selectedItem.title}
                </Typography>
                <Typography variant='caption' sx={{ color: '#66756D' }}>
                  Tenggat: {selectedItem.date} • Status: {selectedItem.status}
                </Typography>
              </Box>
              <Typography variant='body2'><strong>Kawasan:</strong> {selectedItem.area}</Typography>
              <Typography variant='body2'><strong>Surveyor:</strong> {selectedItem.surveyor}</Typography>
              <Typography variant='body2'><strong>Prioritas:</strong> {selectedItem.priority}</Typography>
              <Typography variant='body2'><strong>Jumlah Submission Masuk:</strong> {selectedItem.submissionsCount} Laporan</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          {selectedItem && selectedItem.status !== 'CANCELLED' ? (
            <Button
              variant='outlined'
              color='error'
              onClick={() => handleCancelAssignment(selectedItem.id, selectedItem.code)}
              sx={{ textTransform: 'none' }}
            >
              Batalkan Penugasan
            </Button>
          ) : <Box />}
          <Button
            variant='contained'
            onClick={() => setSelectedItem(null)}
            sx={{ bgcolor: '#176B4D', color: '#ffffff', textTransform: 'none' }}
          >
            Tutup
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
