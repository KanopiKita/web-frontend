'use client'

import { useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
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
import Grid from '@mui/material/Grid'

export default function AreasPage() {
  const areas = [
    {
      id: 'AREA-001',
      name: 'Kawasan Hutan Adat Merangin',
      location: 'Kabupaten Merangin, Jambi',
      hectares: '142.5 Ha',
      totalTrees: 1850,
      adoptedTrees: 620,
      legalStatus: 'VERIFIED_SK',
      publishStatus: 'PUBLISHED',
      manager: 'Lembaga Pengelola Hutan Adat (LPHA)'
    },
    {
      id: 'AREA-002',
      name: 'Kawasan Konservasi Kutai Barat',
      location: 'Kutai Barat, Kalimantan Timur',
      hectares: '280.0 Ha',
      totalTrees: 2420,
      adoptedTrees: 800,
      legalStatus: 'VERIFIED_SK',
      publishStatus: 'PUBLISHED',
      manager: 'Yayasan Konservasi Borneo'
    },
    {
      id: 'AREA-003',
      name: 'Hutan Desa Ciptagelar',
      location: 'Sukabumi, Jawa Barat',
      hectares: '95.0 Ha',
      totalTrees: 580,
      adoptedTrees: 0,
      legalStatus: 'UNDER_REVIEW',
      publishStatus: 'DRAFT',
      manager: 'Kasepuhan Adat Ciptagelar'
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Page Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Kawasan Konservasi & Batas WebGIS
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Manajemen batas wilayah spasial (Polygon GeoJSON), status hak kelola legal, dan publikasi ke peta publik.
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          sx={{ bgcolor: '#176B4D', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#104D39' } }}
        >
          Ajukan Kawasan Baru
        </Button>
      </Box>

      {/* WebGIS Viewer Card Mockup */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <Box
          sx={{
            height: 320,
            bgcolor: '#EAF0EC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            backgroundImage: 'radial-gradient(#83A98C 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        >
          <Box sx={{ textAlign: 'center', p: 4, bgcolor: 'rgba(255,255,255,0.92)', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', maxWidth: '90%' }}>
            <i className='ri-earth-line' style={{ fontSize: '3rem', color: '#176B4D' }} />
            <Typography variant='h6' sx={{ fontWeight: 700, color: '#17251E', mt: 1 }}>
              Leaflet / Mapbox WebGIS Interactive Layer
            </Typography>
            <Typography variant='body2' sx={{ color: '#66756D', maxWidth: 460, mt: 0.5 }}>
              Menampilkan layer polygon 3 kawasan aktif dengan 4,850 titik sebaran koordinat GPS pohon tersurvei.
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2, mt: 2 }}>
              <Chip label='Layer Batas Kawasan' size='small' sx={{ bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 600 }} />
              <Chip label='Layer Titik Pohon' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
              <Chip label='Layer Serapan Karbon' size='small' sx={{ bgcolor: '#E8F2FA', color: '#3478C0', fontWeight: 600 }} />
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Areas Table */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Kawasan Konservasi Terdaftar</Typography>} />
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F7F9F7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Kode & Nama Kawasan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Lokasi & Pengelola</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Luas & Pohon</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status Dokumen Legal</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status Publikasi</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600 }}>Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {areas.map(area => (
                <TableRow key={area.id} hover>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E' }}>{area.name}</Typography>
                    <Typography variant='caption' sx={{ color: '#176B4D', fontWeight: 600 }}>{area.id}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>{area.location}</Typography>
                    <Typography variant='caption' sx={{ color: '#66756D' }}>{area.manager}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>Luas: {area.hectares}</Typography>
                    <Typography variant='caption' sx={{ color: '#66756D' }}>
                      {area.adoptedTrees} / {area.totalTrees} pohon teradopsi
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {area.legalStatus === 'VERIFIED_SK' ? (
                      <Chip label='SK Terverifikasi' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 600 }} />
                    ) : (
                      <Chip label='Menunggu Validasi SK' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    {area.publishStatus === 'PUBLISHED' ? (
                      <Chip label='Dipublikasikan' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 600 }} />
                    ) : (
                      <Chip label='Draft' size='small' sx={{ bgcolor: '#F0F0F0', color: '#66756D', fontWeight: 600 }} />
                    )}
                  </TableCell>
                  <TableCell align='right'>
                    <Button variant='outlined' size='small' sx={{ borderColor: '#176B4D', color: '#176B4D', textTransform: 'none' }}>
                      Detail Polygon
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
