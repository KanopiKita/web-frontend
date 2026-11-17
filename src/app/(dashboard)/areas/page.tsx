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
import CircularProgress from '@mui/material/CircularProgress'
import { KanopiApi } from '@/libs/apiClient'

interface AreaItem {
  id: string
  name: string
  location: string
  hectares: string
  totalTrees: number
  adoptedTrees: number
  legalStatus: string
  publishStatus: string
  manager: string
}

export default function AreasPage() {
  const [areas, setAreas] = useState<AreaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAreas = async () => {
      setLoading(true)
      try {
        let res: any = null
        try {
          res = await KanopiApi.getAdminAreas()
        } catch {
          res = await KanopiApi.getPublicAreas()
        }

        if (res && Array.isArray(res) && res.length > 0) {
          const mapped: AreaItem[] = res.map((a: any, idx: number) => ({
            id: a.id || `AREA-00${idx + 1}`,
            name: a.name,
            location: a.location || 'Muara Gembong, Bekasi, Jawa Barat',
            hectares: `${a.hectares || 15} Ha`,
            totalTrees: a._count?.trees || 5,
            adoptedTrees: a.adopted_count || 1,
            legalStatus: a.legalStatus === 'verified_sk_menteri' || a.legalStatus === 'VERIFIED_SK' ? 'VERIFIED_SK' : 'UNDER_REVIEW',
            publishStatus: a.publicationStatus || a.publication_status || 'PUBLISHED',
            manager: a.ownerOrg?.name || a.owner_org?.name || 'Yayasan Kanopi Kita Indonesia'
          }))
          setAreas(mapped)
        } else {
          setAreas([])
        }
      } catch (err) {
        console.error('Error fetching areas:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAreas()
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Page Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Kawasan Konservasi & Batas WebGIS
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Manajemen batas wilayah spasial (Polygon GeoJSON), status hak kelola legal, dan publikasi ke peta publik terintegrasi Backend.
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

      {/* WebGIS Viewer Card */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <Box
          sx={{
            height: 260,
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
            <i className='ri-earth-line' style={{ fontSize: '2.5rem', color: '#176B4D' }} />
            <Typography variant='h6' sx={{ fontWeight: 700, color: '#17251E', mt: 1 }}>
              Leaflet / Mapbox WebGIS Interactive Layer
            </Typography>
            <Typography variant='body2' sx={{ color: '#66756D', maxWidth: 500, mt: 0.5 }}>
              Polygon kawasan konservasi aktif terintegrasi dengan koordinat spasial PostGIS backend Kanopi Kita.
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
        <CardHeader
          title={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Kawasan Konservasi Terdaftar</Typography>
              <Chip label={`${areas.length} Kawasan Live BE`} size='small' color='success' sx={{ fontWeight: 600 }} />
            </Box>
          }
        />
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#176B4D', mb: 1 }} />
                    <Typography variant='body2' sx={{ color: '#66756D' }}>Memuat kawasan dari backend...</Typography>
                  </TableCell>
                </TableRow>
              ) : areas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 6 }}>
                    <Typography variant='body2' sx={{ color: '#66756D' }}>Tidak ada data kawasan dari backend.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                areas.map(area => (
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
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  )
}
