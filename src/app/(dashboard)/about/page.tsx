'use client'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

export default function AboutPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary' }}>
        Tentang Platform Kanopi Kita Backoffice
      </Typography>
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Chip label='Konservasi Hutan & Mangrove' size='small' sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 600 }} />
            <Chip label='Pemetaan Geospasial WebGIS' size='small' sx={{ bgcolor: '#E8F2FA', color: '#3478C0', fontWeight: 600 }} />
            <Chip label='Sertifikasi Adopsi & Karbon' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
          </Box>
          <Typography variant='body1' sx={{ color: 'text.primary' }}>
            Kanopi Kita adalah platform transparansi konservasi hutan dan adopsi pohon berbasis geospasial (WebGIS) yang menghubungkan Pengelola Kawasan, Surveyor Lapangan, dan Adopter Publik.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  )
}
