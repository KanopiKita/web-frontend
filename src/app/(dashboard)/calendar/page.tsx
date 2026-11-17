'use client'

import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'

export default function CalendarPage() {
  const scheduleItems = [
    {
      date: '20 Nov 2026',
      time: '08:30 - 15:00',
      title: 'Monitoring Rutin Kuartal IV — Blok A',
      area: 'Kawasan Hutan Adat Merangin',
      surveyor: 'Budi Hartono (SRV-04)',
      quota: '60 Pohon Teradopsi',
      type: 'ROUTINE_MONITORING'
    },
    {
      date: '24 Nov 2026',
      time: '09:00 - 16:00',
      title: 'Inspeksi Insiden & Rekomendasi Pergantian',
      area: 'Taman Nasional Bukit Tigapuluh',
      surveyor: 'Siti Rahma (SRV-12)',
      quota: 'Pohon TREE-2026-0410',
      type: 'INCIDENT_TRIAGE'
    },
    {
      date: '28 Nov 2026',
      time: '08:00 - 17:00',
      title: 'Inventarisasi Pohon Baru Calon Adopsi',
      area: 'Kawasan Konservasi Kutai Barat',
      surveyor: 'Ahmad Fauzi (SRV-08)',
      quota: 'Target 100 Pohon Indukan',
      type: 'NEW_SURVEY'
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Jadwal Penugasan & Monitoring Berkala
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Pengaturan jadwal pemantauan 3–6 bulanan pohon yang telah diadopsi dan penugasan surveyor lapangan.
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-calendar-event-line' />}
          sx={{ bgcolor: '#176B4D', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
        >
          Buat Jadwal Penugasan
        </Button>
      </Box>

      <Grid container spacing={5} sx={{ width: '100%', m: 0 }}>
        {scheduleItems.map((item, idx) => (
          <Grid key={idx} size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', height: '100%', overflow: 'hidden', maxWidth: '100%' }}>
              <CardContent sx={{ p: 4, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Chip
                    label={item.date}
                    size='small'
                    sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 700 }}
                  />
                  <Typography variant='caption' sx={{ color: '#66756D' }}>{item.time}</Typography>
                </Box>
                <Typography variant='h6' sx={{ fontWeight: 700, color: '#17251E', mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant='body2' sx={{ color: '#66756D', mb: 0.5 }}>
                  Lokasi: <strong>{item.area}</strong>
                </Typography>
                <Typography variant='body2' sx={{ color: '#66756D', mb: 0.5 }}>
                  Petugas: <strong>{item.surveyor}</strong>
                </Typography>
                <Typography variant='body2' sx={{ color: '#66756D', mb: 2 }}>
                  Target: <strong>{item.quota}</strong>
                </Typography>
                <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid #F0F0F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={item.type === 'INCIDENT_TRIAGE' ? 'Prioritas Tinggi' : 'Rutin'}
                    size='small'
                    sx={{
                      bgcolor: item.type === 'INCIDENT_TRIAGE' ? '#FDECEC' : '#F0F0F0',
                      color: item.type === 'INCIDENT_TRIAGE' ? '#D94B4B' : '#66756D',
                      fontWeight: 600
                    }}
                  />
                  <Button size='small' sx={{ textTransform: 'none', color: '#176B4D', fontWeight: 600 }}>
                    Detail
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
