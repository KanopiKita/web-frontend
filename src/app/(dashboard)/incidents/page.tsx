'use client'

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

export default function IncidentsPage() {
  const incidents = [
    {
      id: 'INC-2026-0012',
      treeId: 'TREE-2026-0410',
      species: 'Meranti Merah',
      area: 'Kawasan Hutan Adat Merangin',
      reportedBy: 'Adopter (PT Bank Mandiri CSR)',
      reportDate: '14 Nov 2026',
      incidentType: 'Tersambar Petir (Batang Patah)',
      triageStatus: 'INSPECTION_ASSIGNED',
      surveyor: 'Budi Hartono',
      actionNeeded: 'Inspeksi Lapangan & Foto Bukti'
    },
    {
      id: 'INC-2026-0011',
      treeId: 'TREE-2026-0188',
      species: 'Kayu Ulin',
      area: 'Kawasan Konservasi Kutai Barat',
      reportedBy: 'Surveyor Rutin (Monitoring Berkala)',
      reportDate: '10 Nov 2026',
      incidentType: 'Mati Alami (Kekeringan)',
      triageStatus: 'REPLACEMENT_DECIDED',
      surveyor: 'Ahmad Fauzi',
      actionNeeded: 'Alokasi Pohon Pengganti (TREE-2026-0885)'
    }
  ]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: '100%', overflow: 'hidden' }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Typography variant='h5' sx={{ fontWeight: 700, color: '#17251E' }}>
            Triage Insiden & Penggantian Pohon
          </Typography>
          <Typography variant='body2' sx={{ color: '#66756D' }}>
            Penanganan laporan pohon sakit/tumbang, penugasan inspeksi surveyor, dan eksekusi pergantian pohon tanpa memutus hak sertifikat adopter.
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<i className='ri-add-line' />}
          sx={{ bgcolor: '#D94B4B', color: '#ffffff', textTransform: 'none', fontWeight: 600, '&:hover': { bgcolor: '#B83838' } }}
        >
          Input Laporan Insiden Baru
        </Button>
      </Box>

      {/* Incidents Table */}
      <Card sx={{ borderRadius: '16px', border: '1px solid #DFE7E0', overflow: 'hidden', maxWidth: '100%' }}>
        <CardHeader title={<Typography variant='h6' sx={{ fontWeight: 700 }}>Daftar Tiket Insiden Aktif</Typography>} />
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: '#F7F9F7' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>ID Tiket & Tanggal</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Pohon & Kawasan</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Jenis Insiden</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Pelapor & Surveyor</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status Triage</TableCell>
                <TableCell align='right' sx={{ fontWeight: 600 }}>Tindakan</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.map(inc => (
                <TableRow key={inc.id} hover>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 700, color: '#D94B4B' }}>{inc.id}</Typography>
                    <Typography variant='caption' sx={{ color: '#66756D' }}>{inc.reportDate}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' sx={{ fontWeight: 600, color: '#17251E' }}>{inc.species}</Typography>
                    <Typography variant='caption' sx={{ color: '#176B4D', fontWeight: 600 }}>{inc.treeId} • {inc.area}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2' sx={{ color: '#17251E' }}>{inc.incidentType}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant='body2'>Pelapor: {inc.reportedBy}</Typography>
                    <Typography variant='caption' sx={{ color: '#66756D' }}>Petugas: {inc.surveyor}</Typography>
                  </TableCell>
                  <TableCell>
                    {inc.triageStatus === 'INSPECTION_ASSIGNED' && (
                      <Chip label='Inspeksi Ditugaskan' size='small' sx={{ bgcolor: '#FEF6E6', color: '#D99A25', fontWeight: 600 }} />
                    )}
                    {inc.triageStatus === 'REPLACEMENT_DECIDED' && (
                      <Chip label='Pohon Pengganti Siap' size='small' sx={{ bgcolor: '#E8F2FA', color: '#3478C0', fontWeight: 600 }} />
                    )}
                  </TableCell>
                  <TableCell align='right'>
                    <Button variant='contained' size='small' sx={{ bgcolor: '#176B4D', textTransform: 'none', fontWeight: 600 }}>
                      Proses Triage
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
