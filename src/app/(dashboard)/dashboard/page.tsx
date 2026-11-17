'use client'

// React & MUI Imports
import { useState, useEffect } from 'react'
import Grid from '@mui/material/Grid'
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
import Avatar from '@mui/material/Avatar'
import LinearProgress from '@mui/material/LinearProgress'
import Box from '@mui/material/Box'
import { KanopiApi } from '@/libs/apiClient'

export default function DashboardPage() {
  const [role, setRole] = useState<'admin' | 'area_owner'>('admin')
  const [realCounts, setRealCounts] = useState<{ totalAreas?: number; totalTrees?: number; adoptedTrees?: number } | null>(null)
  const [backendTrees, setBackendTrees] = useState<any[]>([])

  useEffect(() => {
    KanopiApi.getDashboardAggregates()
      .then(res => {
        if (res) {
          setRealCounts(res)
        }
      })
      .catch(() => {})

    const fetchRecentTrees = async () => {
      try {
        let res: any = null
        try {
          res = await KanopiApi.getAdminTrees({ limit: 5 })
        } catch {
          res = await KanopiApi.getPublicTrees({ limit: 5 })
        }
        if (res && Array.isArray(res) && res.length > 0) {
          const mapped = res.map((t: any) => ({
            id: t.treeCode || t.id,
            speciesLatin: t.species?.scientificName || 'Sonneratia alba',
            speciesLocal: t.species?.localName || 'Mangrove',
            area: t.area?.name || 'Kawasan Restorasi Mangrove Muara Gembong',
            surveyor: 'Budi Field Surveyor (SRV-01)',
            date: t.createdAt ? new Date(t.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '17 Nov 2026',
            status: t.adoptionStatus === 'ADOPTED' ? 'ADOPTED' : t.adoptionStatus === 'RESERVED' ? 'RESERVED' : 'ELIGIBLE_ADOPTION',
            health: t.healthStatus === 'HEALTHY' ? 'Sehat' : 'Butuh Perhatian',
            dbh: `${t.dbhCm || 28.5} cm`,
            height: `${t.heightM || 6.4} m`
          }))
          setBackendTrees(mapped)
        }
      } catch {}
    }
    fetchRecentTrees()
  }, [])

  // Sample data conforming to Kanopi Kita PRD
  const kpiData = [
    {
      title: 'Kawasan Konservasi',
      value: realCounts?.totalAreas ? `${realCounts.totalAreas} Kawasan Aktif` : '12 Kawasan',
      subtitle: '+2 menunggu verifikasi legalitas',
      icon: 'ri-map-pin-2-fill',
      iconBg: '#E7F3EC',
      iconColor: '#176B4D',
      trend: '+16.5% vs kuartal lalu'
    },
    {
      title: 'Pohon Terverifikasi',
      value: realCounts?.totalTrees ? `${realCounts.totalTrees} Pohon Terdaftar` : '4,850 Pohon',
      subtitle: 'Tersebar di seluruh blok kawasan konservasi',
      icon: 'ri-plant-fill',
      iconBg: '#E7F3EC',
      iconColor: '#21865B',
      trend: '100% terverifikasi GPS'
    },
    {
      title: 'Pohon Teradopsi',
      value: realCounts?.adoptedTrees ? `${realCounts.adoptedTrees} Pohon Teradopsi` : '1,420 Pohon',
      subtitle: '29.2% dari target adopsi kawasan',
      icon: 'ri-hand-heart-fill',
      iconBg: '#FEF6E6',
      iconColor: '#D99A25',
      trend: 'Rp 426 Juta total dana terkumpul'
    },
    {
      title: 'Estimasi Karbon Terserap',
      value: '324.5 Ton CO₂e',
      subtitle: 'Metodologi karbon terverifikasi v1.2',
      icon: 'ri-cloud-windy-fill',
      iconBg: '#E8F2FA',
      iconColor: '#3478C0',
      trend: '+18.2 Ton serapan aktif'
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%' }}>
      {/* Top Banner / Welcome Section */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #176B4D 0%, #104D39 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 24px rgba(23, 107, 77, 0.18)'
        }}
      >
        <CardContent sx={{ p: { xs: 4, md: 6 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 1 }}>
                <Typography variant='h4' sx={{ color: '#ffffff', fontWeight: 700, fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.85rem' } }}>
                  Selamat Datang di Kanopi Kita Backoffice
                </Typography>
                <Chip
                  label={role === 'admin' ? 'PLATFORM ADMIN' : 'PEMILIK KAWASAN'}
                  size='small'
                  sx={{
                    bgcolor: '#C8E66A',
                    color: '#17251E',
                    fontWeight: 700,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
              <Typography variant='body1' sx={{ color: 'rgba(255, 255, 255, 0.85)', maxWidth: 640 }}>
                Pusat verifikasi hasil survei lapangan, pemantauan adopsi pohon, batas polygon kawasan WebGIS, dan validasi data serapan karbon.
              </Typography>
            </Box>

            {/* Role Switcher for preview */}
            <Box sx={{ display: 'flex', gap: 1, bgcolor: 'rgba(255,255,255,0.12)', p: 1, borderRadius: '12px' }}>
              <Button
                variant={role === 'admin' ? 'contained' : 'text'}
                size='small'
                onClick={() => setRole('admin')}
                sx={{
                  bgcolor: role === 'admin' ? '#ffffff' : 'transparent',
                  color: role === 'admin' ? '#176B4D' : '#ffffff',
                  fontWeight: 600,
                  '&:hover': { bgcolor: role === 'admin' ? '#f0f0f0' : 'rgba(255,255,255,0.15)' }
                }}
              >
                Mode Admin
              </Button>
              <Button
                variant={role === 'area_owner' ? 'contained' : 'text'}
                size='small'
                onClick={() => setRole('area_owner')}
                sx={{
                  bgcolor: role === 'area_owner' ? '#ffffff' : 'transparent',
                  color: role === 'area_owner' ? '#176B4D' : '#ffffff',
                  fontWeight: 600,
                  '&:hover': { bgcolor: role === 'area_owner' ? '#f0f0f0' : 'rgba(255,255,255,0.15)' }
                }}
              >
                Mode Area Owner
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* KPI Cards Grid */}
      <Grid container spacing={5} sx={{ width: '100%', m: 0 }}>
        {kpiData.map((kpi, idx) => (
          <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                borderRadius: '16px',
                border: '1px solid #DFE7E0',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
                }
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: kpi.iconBg,
                      color: kpi.iconColor,
                      width: 48,
                      height: 48,
                      borderRadius: '12px'
                    }}
                  >
                    <i className={kpi.icon} style={{ fontSize: '1.5rem' }} />
                  </Avatar>
                  <Typography variant='caption' sx={{ color: '#21865B', fontWeight: 600, bgcolor: '#E7F3EC', px: 1.5, py: 0.5, borderRadius: '8px' }}>
                    Aktif
                  </Typography>
                </Box>
                <Typography variant='h5' sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                  {kpi.value}
                </Typography>
                <Typography variant='body2' sx={{ color: 'text.secondary', fontWeight: 500, mb: 1.5 }}>
                  {kpi.title}
                </Typography>
                <Typography variant='caption' sx={{ color: '#889890', display: 'block' }}>
                  {kpi.subtitle}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Main Grid: Priority Survey Submissions & Health Stats */}
      <Grid container spacing={5} sx={{ width: '100%', m: 0 }}>
        {/* Table: Antrean Review Survei Lapangan */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', maxWidth: '100%' }}>
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ minWidth: 0, flex: '1 1 240px' }}>
                    <Typography variant='h6' sx={{ fontWeight: 700, color: 'text.primary' }}>
                      Antrean Verifikasi Lapangan (Survei Pohon)
                    </Typography>
                    <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                      Input terbaru dari surveyor mobile yang memerlukan persetujuan sebelum dipublikasikan ke katalog adopsi.
                    </Typography>
                  </Box>
                  <Button variant='outlined' size='small' href='/trees' sx={{ borderColor: '#176B4D', color: '#176B4D', textTransform: 'none' }}>
                    Lihat Semua
                  </Button>
                </Box>
              }
              sx={{ pb: 1 }}
            />
            <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
              <Table sx={{ minWidth: 650 }}>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>ID & Pohon</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Kawasan</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Surveyor & Waktu</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Status</TableCell>
                    <TableCell align='right' sx={{ fontWeight: 600, color: 'text.primary' }}>Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {backendTrees.map(row => (
                    <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant='body2' sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {row.speciesLocal}
                          </Typography>
                          <Typography variant='caption' sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                            {row.speciesLatin}
                          </Typography>
                          <Typography variant='caption' sx={{ color: '#176B4D', fontWeight: 600, mt: 0.5 }}>
                            {row.id} • DBH {row.dbh}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ color: 'text.primary' }}>
                          {row.area}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant='body2' sx={{ color: 'text.primary' }}>
                          {row.surveyor}
                        </Typography>
                        <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                          {row.date}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {row.status === 'PENDING_REVIEW' && (
                          <Chip label='Menunggu Review' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
                        )}
                        {row.status === 'NEEDS_INSPECTION' && (
                          <Chip label='Butuh Inspeksi' size='small' sx={{ bgcolor: '#FDECEC', color: '#D94B4B', fontWeight: 600 }} />
                        )}
                        {(row.status === 'ELIGIBLE_ADOPTION' || row.status === 'VERIFIED') && (
                          <Chip label='Siap Diadopsi' size='small' sx={{ bgcolor: '#E7F3EC', color: '#21865B', fontWeight: 600 }} />
                        )}
                        {row.status === 'ADOPTED' && (
                          <Chip label='Sudah Diadopsi' size='small' sx={{ bgcolor: '#E8F2FA', color: '#3478C0', fontWeight: 600 }} />
                        )}
                        {row.status === 'RESERVED' && (
                          <Chip label='Dipesan' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
                        )}
                      </TableCell>
                      <TableCell align='right'>
                        <Button
                          variant='contained'
                          size='small'
                          href='/trees'
                          sx={{
                            bgcolor: '#176B4D',
                            color: '#ffffff',
                            textTransform: 'none',
                            borderRadius: '8px',
                            fontWeight: 600,
                            '&:hover': { bgcolor: '#104D39' }
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Side Panel: Quick Actions & Health Overview */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, maxWidth: '100%' }}>
            {/* Quick Actions Card */}
            <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', maxWidth: '100%' }}>
              <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Aksi Cepat Operasional</Typography>} />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant='outlined'
                  fullWidth
                  href='/areas'
                  startIcon={<i className='ri-map-pin-add-line' />}
                  sx={{ justifyContent: 'flex-start', py: 1.5, borderColor: '#DFE7E0', color: 'text.primary', textTransform: 'none', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  Ajukan / Verifikasi Batas Kawasan Baru
                </Button>
                <Button
                  variant='outlined'
                  fullWidth
                  href='/trees'
                  startIcon={<i className='ri-checkbox-circle-line' />}
                  sx={{ justifyContent: 'flex-start', py: 1.5, borderColor: '#DFE7E0', color: 'text.primary', textTransform: 'none', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  Review Batch Pohon Siap Adopsi
                </Button>
                <Button
                  variant='outlined'
                  fullWidth
                  href='/incidents'
                  startIcon={<i className='ri-alarm-warning-line' />}
                  sx={{ justifyContent: 'flex-start', py: 1.5, borderColor: '#DFE7E0', color: '#D94B4B', textTransform: 'none', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  Triage Insiden Pohon Sakit / Tumbang
                </Button>
                <Button
                  variant='outlined'
                  fullWidth
                  href='/master/species'
                  startIcon={<i className='ri-seedling-line' />}
                  sx={{ justifyContent: 'flex-start', py: 1.5, borderColor: '#DFE7E0', color: 'text.primary', textTransform: 'none', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  Kelola Master Spesies & Skema Form
                </Button>
                <Button
                  variant='outlined'
                  fullWidth
                  href='/settings/system'
                  startIcon={<i className='ri-key-2-line' />}
                  sx={{ justifyContent: 'flex-start', py: 1.5, borderColor: '#DFE7E0', color: '#176B4D', textTransform: 'none', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  Kredensial Mapbox & Pengaturan API
                </Button>
              </CardContent>
            </Card>

            {/* Health Distribution Card */}
            <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', maxWidth: '100%' }}>
              <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Distribusi Kondisi Pohon</Typography>} />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>Sehat & Produktif</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#21865B' }}>88.2% (4,278)</Typography>
                  </Box>
                  <LinearProgress variant='determinate' value={88.2} sx={{ height: 8, borderRadius: 4, bgcolor: '#E7F3EC', '& .MuiLinearProgress-bar': { bgcolor: '#21865B' } }} />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>Butuh Pemulihan / Sakit</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#D99A25' }}>9.4% (456)</Typography>
                  </Box>
                  <LinearProgress variant='determinate' value={9.4} sx={{ height: 8, borderRadius: 4, bgcolor: '#FEF6E6', '& .MuiLinearProgress-bar': { bgcolor: '#D99A25' } }} />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary' }}>Kritis / Butuh Pergantian</Typography>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#D94B4B' }}>2.4% (116)</Typography>
                  </Box>
                  <LinearProgress variant='determinate' value={2.4} sx={{ height: 8, borderRadius: 4, bgcolor: '#FDECEC', '& .MuiLinearProgress-bar': { bgcolor: '#D94B4B' } }} />
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  )
}
