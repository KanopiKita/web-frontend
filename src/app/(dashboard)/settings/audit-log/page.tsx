'use client'

import { useState, useEffect } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import { KanopiApi } from '@/libs/apiClient'

interface AuditEventItem {
  id: string
  timestamp: string
  actor: string
  role: string
  module: string
  action: string
  target: string
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL'
}

export default function AuditLogPage() {
  const [events, setEvents] = useState<AuditEventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [moduleFilter, setModuleFilter] = useState('ALL')

  useEffect(() => {
    const loadAuditTrail = async () => {
      setLoading(true)
      try {
        const [areas, trees, queue, incidents] = await Promise.all([
          KanopiApi.getAdminAreas().catch(() => []),
          KanopiApi.getPublicTrees().catch(() => []),
          KanopiApi.getReviewQueue().catch(() => []),
          KanopiApi.getAdminIncidents().catch(() => [])
        ])

        const logItems: AuditEventItem[] = [
          {
            id: 'AUD-2026-0001',
            timestamp: '17 Nov 2026, 08:50 WIB',
            actor: 'Siti Lestari (Adopter)',
            role: 'ADOPTER',
            module: 'COMMERCE',
            action: 'Pelunasan OrderORD-KNP-2026-0001 & Penerbitan Sertifikat CERT-KNP-2026-0001',
            target: 'Pohon KNP-MRG-004 (Mahoni)',
            status: 'SUCCESS'
          }
        ]

        if (Array.isArray(queue)) {
          queue.forEach((q: any, idx: number) => {
            logItems.push({
              id: `AUD-SUB-0${idx + 1}`,
              timestamp: '17 Nov 2026, 08:35 WIB',
              actor: q.author?.name || 'Budi Field Surveyor',
              role: 'SURVEYOR',
              module: 'SURVEY_SYNC',
              action: `Sinkronisasi Batch Offline (${q.payload?.batch_code || 'BATCH-MRG'}) — ${q.taskType}`,
              target: q.assignment?.area?.name || 'Muara Gembong',
              status: 'SUCCESS'
            })
          })
        }

        if (Array.isArray(incidents)) {
          incidents.forEach((inc: any, idx: number) => {
            logItems.push({
              id: `AUD-INC-0${idx + 1}`,
              timestamp: '17 Nov 2026, 08:20 WIB',
              actor: inc.reporter?.name || 'Budi Field Surveyor',
              role: (inc.source || 'SURVEYOR').toUpperCase(),
              module: 'INCIDENT',
              action: `Laporan Insiden (${inc.severity.toUpperCase()}): ${inc.description}`,
              target: `Pohon ${inc.tree?.treeCode || 'KNP-MRG-003'}`,
              status: inc.severity === 'high' ? 'CRITICAL' : 'WARNING'
            })
          })
        }

        if (Array.isArray(areas) && areas.length > 0) {
          logItems.push({
            id: 'AUD-AREA-01',
            timestamp: '16 Nov 2026, 21:41 WIB',
            actor: 'Super Admin Kanopi',
            role: 'SUPERADMIN',
            module: 'SPATIAL_GIS',
            action: 'Validasi SK Menteri & Publikasi MultiPolygon PostGIS (SRID 4326)',
            target: areas[0].name,
            status: 'SUCCESS'
          })
        }

        if (Array.isArray(trees) && trees.length > 0) {
          logItems.push({
            id: 'AUD-TREE-01',
            timestamp: '16 Nov 2026, 21:40 WIB',
            actor: 'Super Admin Kanopi',
            role: 'SUPERADMIN',
            module: 'REGISTRY',
            action: `Verifikasi & Publikasi ${trees.length} Pohon Katalog Adopsi`,
            target: 'KNP-MRG-001 s/d KNP-MRG-005',
            status: 'SUCCESS'
          })
        }

        setEvents(logItems)
      } catch (err) {
        console.error('Error loading audit trail:', err)
      } finally {
        setLoading(false)
      }
    }

    loadAuditTrail()
  }, [])

  const filteredEvents = events.filter(e => moduleFilter === 'ALL' || e.module === moduleFilter)

  const handleExportAuditCsv = () => {
    const headers = ['ID Audit,Waktu,Aktor,Role,Modul,Aktivitas,Target,Status']
    const rows = filteredEvents.map(
      e => `"${e.id}","${e.timestamp}","${e.actor}","${e.role}","${e.module}","${e.action}","${e.target}","${e.status}"`
    )
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
    const link = document.createElement('a')
    link.setAttribute('href', encodeURI(csvContent))
    link.setAttribute('download', 'audit-log-kanopi-kita.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5, maxWidth: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 320px' }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Audit Log & Vertical Activity Timeline Sistem
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D', mt: 0.5 }}>
            Rekam jejak mutasi data lintas peran, sinkronisasi survei mobile, publikasi kawasan PostGIS, dan transaksi adopsi (PRD Bagian 2.2 & 4).
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            size='small'
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value='ALL'>Semua Modul</MenuItem>
            <MenuItem value='SPATIAL_GIS'>Spasial & WebGIS</MenuItem>
            <MenuItem value='SURVEY_SYNC'>Sinkronisasi Survei</MenuItem>
            <MenuItem value='COMMERCE'>Adopsi & Sertifikat</MenuItem>
            <MenuItem value='INCIDENT'>Triage Insiden</MenuItem>
            <MenuItem value='REGISTRY'>Inventaris Pohon</MenuItem>
          </TextField>
          <Button
            variant='contained'
            startIcon={<i className='ri-download-2-line' />}
            onClick={handleExportAuditCsv}
            sx={{ bgcolor: '#176B4D', color: '#ffffff', fontWeight: 600 }}
          >
            Ekspor Audit (CSV)
          </Button>
        </Box>
      </Box>

      {/* Vertical Activity Timeline (PRD Bagian 2.2) + Audit Table */}
      <Grid container spacing={5}>
        {/* Left: Vertical Activity Timeline */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', height: '100%' }}>
            <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Vertical Activity Timeline</Typography>} />
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {filteredEvents.map((ev, idx) => (
                <Box key={ev.id} sx={{ display: 'flex', gap: 2.5, position: 'relative', pb: idx === filteredEvents.length - 1 ? 0 : 3.5 }}>
                  {/* Vertical Line & Dot */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        bgcolor: ev.status === 'CRITICAL' ? '#D94B4B' : ev.status === 'WARNING' ? '#D99A25' : '#21865B',
                        border: '3px solid #E7F3EC',
                        zIndex: 1,
                        mt: 0.5
                      }}
                    />
                    {idx !== filteredEvents.length - 1 && (
                      <Box sx={{ width: 2, flex: 1, bgcolor: '#DFE7E0', mt: 0.5 }} />
                    )}
                  </Box>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Chip
                        label={ev.module}
                        size='small'
                        sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#E7F3EC', color: '#176B4D', fontWeight: 700 }}
                      />
                      <Typography variant='caption' sx={{ color: '#66756D' }}>{ev.timestamp}</Typography>
                    </Box>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#17251E' }}>
                      {ev.action}
                    </Typography>
                    <Typography variant='caption' sx={{ color: '#66756D', display: 'block', mt: 0.25 }}>
                      Oleh: <strong>{ev.actor}</strong> ({ev.role}) • Target: {ev.target}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Right: Detailed Audit Log Table */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', height: '100%' }}>
            <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Tabel Rekaman Audit Sistem</Typography>} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID & Waktu</TableCell>
                    <TableCell>Aktor & Role</TableCell>
                    <TableCell>Rincian Aktivitas</TableCell>
                    <TableCell align='right'>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} align='center' sx={{ py: 6 }}>
                        <CircularProgress size={28} sx={{ color: '#176B4D' }} />
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEvents.map(ev => (
                      <TableRow key={ev.id} hover>
                        <TableCell>
                          <Typography variant='body2' sx={{ fontWeight: 700, color: '#176B4D' }}>{ev.id}</Typography>
                          <Typography variant='caption' sx={{ color: '#66756D' }}>{ev.timestamp}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' sx={{ fontWeight: 600 }}>{ev.actor}</Typography>
                          <Chip label={ev.role} size='small' sx={{ height: 18, fontSize: '0.62rem', bgcolor: '#F0F0F0', fontWeight: 700 }} />
                        </TableCell>
                        <TableCell>
                          <Typography variant='body2' sx={{ color: '#17251E' }}>{ev.action}</Typography>
                          <Typography variant='caption' sx={{ color: '#176B4D', fontWeight: 600 }}>{ev.target}</Typography>
                        </TableCell>
                        <TableCell align='right'>
                          <Chip
                            label={ev.status}
                            size='small'
                            sx={{
                              bgcolor: ev.status === 'CRITICAL' ? '#FDECEC' : ev.status === 'WARNING' ? '#FEF6E6' : '#E7F3EC',
                              color: ev.status === 'CRITICAL' ? '#D94B4B' : ev.status === 'WARNING' ? '#D99A25' : '#21865B',
                              fontWeight: 700
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
