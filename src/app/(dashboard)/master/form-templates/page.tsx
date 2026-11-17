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

const TASK_LABELS: Record<string, string> = {
  tree_registration: 'Registrasi & Tagging Pohon Baru',
  tree_inspection: 'Inspeksi Kesehatan & Triage Hama',
  monitoring: 'Monitoring Berkala Pertumbuhan & Karbon'
}

export default function FormTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [taskType, setTaskType] = useState('monitoring')
  const [version, setVersion] = useState(2)
  const [minPhotos, setMinPhotos] = useState(1)
  const [maxPhotos, setMaxPhotos] = useState(4)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const res = await KanopiApi.getAdminFormTemplates()
      if (Array.isArray(res)) {
        setTemplates(res)
      }
    } catch (err) {
      console.error('Error fetching form templates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setFeedback(null)
    try {
      await KanopiApi.createFormTemplate({
        task_type: taskType,
        version: Number(version),
        schema: {
          fields: [
            { name: 'diameter_cm', label: 'Diameter Batang (DBH cm)', type: 'number', required: true },
            { name: 'height_m', label: 'Tinggi Pohon (m)', type: 'number', required: true },
            { name: 'health_status', label: 'Status Kesehatan', type: 'select', options: ['HEALTHY', 'ATTENTION', 'UNHEALTHY', 'CRITICAL'], required: true },
            { name: 'canopy_cover_pct', label: 'Tutupan Tajuk (%)', type: 'number' },
            { name: 'notes', label: 'Catatan Lapangan Surveyor', type: 'textarea' }
          ]
        },
        evidence_rules: {
          min_photos: Number(minPhotos),
          max_photos: Number(maxPhotos),
          require_gps: true
        }
      })
      setOpenCreate(false)
      setFeedback({ type: 'success', message: `Template form "${taskType}" v${version} berhasil diterbitkan!` })
      await fetchTemplates()
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal membuat versi template baru.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 320px' }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Master Template Form Survei Lapangan
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D', mt: 0.5 }}>
            Konfigurasi variabel input dinamis dan aturan kelengkapan foto bukti untuk kegiatan survei lapangan.
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          onClick={() => setOpenCreate(true)}
          sx={{ bgcolor: '#176B4D', color: '#ffffff', textTransform: 'none', fontWeight: 600 }}
        >
          Buat Versi Template Baru
        </Button>
      </Box>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ borderRadius: '12px' }}>
          {feedback.message}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
          <CircularProgress size={34} sx={{ color: '#176B4D', mb: 2 }} />
          <Typography variant='body2' sx={{ color: '#66756D' }}>Memuat skema form survei dari backend...</Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {templates.map(tpl => {
            const fields = tpl.schema?.fields || []
            const rules = tpl.evidenceRules || {}
            return (
              <Grid key={tpl.id} size={{ xs: 12, md: 4 }}>
                <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', height: '100%' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        label={`Versi v${tpl.version}`}
                        size='small'
                        sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 700 }}
                      />
                      <Chip
                        label={tpl.status}
                        size='small'
                        color={tpl.status === 'PUBLISHED' ? 'success' : 'default'}
                        sx={{ fontWeight: 700 }}
                      />
                    </Box>

                    <Box>
                      <Typography variant='h6' sx={{ fontWeight: 700, color: '#17251E' }}>
                        {TASK_LABELS[tpl.taskType] || tpl.taskType}
                      </Typography>
                      <Typography variant='caption' sx={{ color: '#176B4D', fontWeight: 600 }}>
                        Task Key: <code>{tpl.taskType}</code> • Checksum: <code>{tpl.checksum}</code>
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: '#F6FAF7', borderRadius: '10px', flex: 1 }}>
                      <Typography variant='caption' sx={{ fontWeight: 700, color: '#485B50', display: 'block', mb: 1 }}>
                        FIELD INPUT ({fields.length} Variabel):
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                        {fields.map((f: any, idx: number) => (
                          <Chip
                            key={idx}
                            label={`${f.label} (${f.type})`}
                            size='small'
                            sx={{ bgcolor: '#FFFFFF', border: '1px solid #DFE7E0', fontSize: '0.7rem' }}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                      <Typography variant='caption' sx={{ color: '#66756D' }}>
                        📸 Foto: {rules.min_photos ?? 1}–{rules.max_photos ?? 5} • 📍 GPS Wajib
                      </Typography>
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={() => setSelectedTemplate(tpl)}
                        sx={{ borderColor: '#176B4D', color: '#176B4D', fontWeight: 600 }}
                      >
                        Lihat JSON
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Modal Inspect JSON Schema */}
      <Dialog open={Boolean(selectedTemplate)} onClose={() => setSelectedTemplate(null)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          JSON Schema Form Template ({selectedTemplate?.taskType} v{selectedTemplate?.version})
        </DialogTitle>
        <DialogContent dividers>
          <Box
            component='pre'
            sx={{
              p: 2.5,
              bgcolor: '#17251E',
              color: '#C8E66A',
              borderRadius: '10px',
              fontSize: '0.75rem',
              overflowX: 'auto',
              m: 0
            }}
          >
            {JSON.stringify(
              {
                task_type: selectedTemplate?.taskType,
                version: selectedTemplate?.version,
                status: selectedTemplate?.status,
                schema: selectedTemplate?.schema,
                evidence_rules: selectedTemplate?.evidenceRules
              },
              null,
              2
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={() => setSelectedTemplate(null)} sx={{ bgcolor: '#176B4D', color: '#ffffff' }}>
            Tutup
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Buat Versi Template Baru */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth='sm' fullWidth>
        <form onSubmit={handleCreateTemplate}>
          <DialogTitle sx={{ fontWeight: 700 }}>Buat Versi Form Template Baru</DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              select
              fullWidth
              label='Tipe Tugas Survei (Task Type)'
              value={taskType}
              onChange={e => setTaskType(e.target.value)}
            >
              <MenuItem value='tree_registration'>tree_registration — Registrasi Pohon Baru</MenuItem>
              <MenuItem value='tree_inspection'>tree_inspection — Inspeksi Kesehatan Pohon</MenuItem>
              <MenuItem value='monitoring'>monitoring — Monitoring Berkala</MenuItem>
            </TextField>
            <TextField
              fullWidth
              type='number'
              label='Nomor Versi Template'
              value={version}
              onChange={e => setVersion(Number(e.target.value))}
              required
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                fullWidth
                type='number'
                label='Minimal Foto Bukti'
                value={minPhotos}
                onChange={e => setMinPhotos(Number(e.target.value))}
              />
              <TextField
                fullWidth
                type='number'
                label='Maksimal Foto Bukti'
                value={maxPhotos}
                onChange={e => setMaxPhotos(Number(e.target.value))}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreate(false)} sx={{ color: '#66756D' }}>Batal</Button>
            <Button type='submit' variant='contained' disabled={submitting} sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600 }}>
              {submitting ? 'Menerbitkan...' : 'Terbitkan Template'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
